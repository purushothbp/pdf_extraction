const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Database = require('./database');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const db = new Database();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Receipt Processing API is running!' });
});

app.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        success: false 
      });
    }

    const fileName = req.file.originalname;
    const filePath = req.file.path;

    try {
      const existingFile = await db.checkDuplicateFile(fileName);

      if (existingFile) {
        fs.unlinkSync(filePath);
        return res.status(409).json({ 
          error: 'File already exists',
          success: false,
          existingFileId: existingFile.id
        });
      }

      const fileId = await db.insertReceiptFile(fileName, filePath);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        fileId: fileId,
        fileName: fileName,
        filePath: filePath
      });
    } catch (dbError) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw dbError;
    }

  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ 
      error: 'Upload failed: ' + error.message,
      success: false 
    });
  }
});

app.post('/validate', async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        error: 'File ID is required',
        success: false
      });
    }

    const fileRecord = await db.getReceiptFileById(fileId);

    if (!fileRecord) {
      return res.status(404).json({
        error: 'File not found',
        success: false
      });
    }

    if (!fs.existsSync(fileRecord.file_path)) {
      await db.updateReceiptFileValidation(fileId, false, 'File not found on disk');
      return res.status(404).json({
        error: 'File not found on disk',
        success: false
      });
    }

    const fileBuffer = fs.readFileSync(fileRecord.file_path);

    try {
      const data = await pdfParse(fileBuffer);

      if (data.text && data.text.trim().length > 0) {
        await db.updateReceiptFileValidation(fileId, true, null);

        res.json({
          success: true,
          message: 'File is valid PDF',
          fileId: fileId,
          isValid: true,
          textLength: data.text.length
        });
      } else {
        await db.updateReceiptFileValidation(fileId, false, 'PDF contains no readable text');

        res.status(400).json({
          success: false,
          message: 'PDF contains no readable text',
          fileId: fileId,
          isValid: false,
          invalidReason: 'PDF contains no readable text'
        });
      }
    } catch (pdfError) {
      const invalidReason = 'Invalid PDF format or corrupted file';
      await db.updateReceiptFileValidation(fileId, false, invalidReason);

      res.status(400).json({
        success: false,
        message: invalidReason,
        fileId: fileId,
        isValid: false,
        invalidReason: invalidReason,
        error: pdfError.message
      });
    }

  } catch (error) {
    res.status(500).json({
      error: 'Validation failed: ' + error.message,
      success: false
    });
  }
});

app.post('/process', async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        error: 'File ID is required',
        success: false
      });
    }

    const fileRecord = await db.getReceiptFileById(fileId);

    if (!fileRecord) {
      return res.status(404).json({
        error: 'File not found',
        success: false
      });
    }

    if (!fileRecord.is_valid) {
      return res.status(400).json({
        error: 'File is not valid. Please validate first.',
        success: false
      });
    }

    if (fileRecord.is_processed) {
      return res.status(409).json({
        error: 'File has already been processed',
        success: false
      });
    }

    try {
      const fileBuffer = fs.readFileSync(fileRecord.file_path);
      const pdfData = await pdfParse(fileBuffer);
      const receiptText = pdfData.text;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'Gemini API key not configured',
          success: false
        });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Extract the following information from this receipt text. Return the data in JSON format with these exact field names:
        - purchased_at: Date and time of purchase (in ISO format if possible, or the original format from receipt)
        - merchant_name: Name of the merchant/store
        - total_amount: Total amount as a number (without currency symbols)

        If any information is not found, use null for that field.
        Only return the JSON object, no additional text.

        Receipt text:
        ${receiptText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const extractedText = response.text();

      let extractedData;
      try {
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', extractedText);
        return res.status(500).json({
          error: 'Failed to parse extracted data',
          success: false,
          aiResponse: extractedText
        });
      }

      const purchasedAt = extractedData.purchased_at || null;
      const merchantName = extractedData.merchant_name || 'Unknown';
      const totalAmount = parseFloat(extractedData.total_amount) || 0;

      const receiptId = await db.insertReceipt(fileId, purchasedAt, merchantName, totalAmount, fileRecord.file_path);
      await db.updateReceiptFileProcessed(fileId);

      res.json({
        success: true,
        message: 'Receipt processed successfully',
        receiptId: receiptId,
        extractedData: {
          purchased_at: purchasedAt,
          merchant_name: merchantName,
          total_amount: totalAmount
        }
      });

    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      return res.status(500).json({
        error: 'Failed to process receipt with AI: ' + aiError.message,
        success: false
      });
    }

  } catch (error) {
    res.status(500).json({
      error: 'Processing failed: ' + error.message,
      success: false
    });
  }
});

app.get('/receipts', async (req, res) => {
  try {
    const receipts = await db.getAllReceipts();

    res.json({
      success: true,
      count: receipts.length,
      receipts: receipts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve receipts: ' + error.message,
      success: false
    });
  }
});

app.get('/receipts/:id', async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);

    if (isNaN(receiptId)) {
      return res.status(400).json({
        error: 'Invalid receipt ID',
        success: false
      });
    }

    const receipt = await db.getReceiptById(receiptId);

    if (!receipt) {
      return res.status(404).json({
        error: 'Receipt not found',
        success: false
      });
    }

    res.json({
      success: true,
      receipt: receipt
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve receipt: ' + error.message,
      success: false
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
