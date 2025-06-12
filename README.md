# Receipt Processing System

A full-stack web application that automates the extraction of information from scanned PDF receipts using AI-powered OCR technology. The system uploads, validates, processes, and stores receipt data with a modern React frontend and Node.js backend.

## Features

- **PDF Receipt Upload**: Upload PDF receipt files with validation
- **Automatic Validation**: Validates PDF files and ensures readable text content
- **AI-Powered Extraction**: Uses Google Gemini AI to extract merchant name, purchase date, and total amount
- **Data Management**: Stores extracted data in SQLite database with full CRUD operations
- **Modern UI**: Clean, responsive React interface with Tailwind CSS
- **Real-time Processing**: Live updates and status tracking during upload and processing

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **JavaScript ES6+** for modern functionality

### Backend
- **Node.js** with Express.js framework
- **SQLite3** database for data persistence
- **Google Generative AI (Gemini)** for text extraction
- **PDF-Parse** for PDF text extraction
- **Multer** for file upload handling

## Project Structure

```
puru/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx    # File upload component
│   │   │   └── ReceiptList.jsx   # Receipt management component
│   │   ├── App.jsx               # Main application component
│   │   └── index.css             # Tailwind CSS imports
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Node.js backend API
│   ├── server.js            # Main server file with API endpoints
│   ├── database.js          # SQLite database setup and queries
│   ├── package.json
│   └── .env.example         # Environment variables template
├── uploads/                 # Directory for uploaded PDF files
├── database/               # Directory for SQLite database file
└── README.md              # This file
```

## Database Schema

### receipt_file Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique identifier for uploaded file |
| file_name | TEXT | Original filename |
| file_path | TEXT | Storage path of uploaded file |
| is_valid | BOOLEAN | Whether file is a valid PDF |
| invalid_reason | TEXT | Reason for invalid file (if applicable) |
| is_processed | BOOLEAN | Whether file has been processed |
| created_at | DATETIME | Upload timestamp |
| updated_at | DATETIME | Last modification timestamp |

### receipt Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique identifier for extracted receipt |
| file_id | INTEGER | Foreign key to receipt_file table |
| purchased_at | DATETIME | Date of purchase (extracted) |
| merchant_name | TEXT | Merchant name (extracted) |
| total_amount | REAL | Total amount (extracted) |
| file_path | TEXT | Path to original PDF file |
| created_at | DATETIME | Processing timestamp |
| updated_at | DATETIME | Last modification timestamp |

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Google Gemini API key

### 1. Clone and Navigate
```bash
cd /path/to/puru
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file and add your Gemini API key
# GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Server will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will start on http://localhost:5173

## API Endpoints

### POST /upload
Upload a PDF receipt file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `receipt` (file field)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "fileId": 1,
  "fileName": "receipt.pdf",
  "filePath": "/path/to/receipt.pdf"
}
```

### POST /validate
Validate an uploaded PDF file.

**Request:**
```json
{
  "fileId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "File is valid PDF",
  "fileId": 1,
  "isValid": true,
  "textLength": 1250
}
```

### POST /process
Process a validated PDF and extract receipt data using AI.

**Request:**
```json
{
  "fileId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt processed successfully",
  "receiptId": 1,
  "extractedData": {
    "purchased_at": "2024-01-15T10:30:00",
    "merchant_name": "Best Buy",
    "total_amount": 299.99
  }
}
```

### GET /receipts
Retrieve all processed receipts.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "receipts": [
    {
      "id": 1,
      "file_id": 1,
      "purchased_at": "2024-01-15T10:30:00",
      "merchant_name": "Best Buy",
      "total_amount": 299.99,
      "file_name": "receipt.pdf",
      "created_at": "2024-01-15T15:45:00"
    }
  ]
}
```

### GET /receipts/:id
Retrieve a specific receipt by ID.

**Response:**
```json
{
  "success": true,
  "receipt": {
    "id": 1,
    "file_id": 1,
    "purchased_at": "2024-01-15T10:30:00",
    "merchant_name": "Best Buy",
    "total_amount": 299.99,
    "file_name": "receipt.pdf",
    "created_at": "2024-01-15T15:45:00"
  }
}
```

## Usage Instructions

1. **Start both backend and frontend servers** as described in the setup section

2. **Open your browser** and navigate to http://localhost:5173

3. **Upload a PDF receipt:**
   - Click "Choose File" and select a PDF receipt
   - Click "Upload & Process" button
   - Watch the progress through validation and AI processing

4. **View processed receipts:**
   - Scroll down to see the receipts table
   - Click "View Details" to see full receipt information
   - Table updates automatically after new uploads

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

## Error Handling

The application includes comprehensive error handling for:
- Invalid file types (non-PDF files)
- Corrupted or unreadable PDF files
- Missing or invalid API keys
- Database connection errors
- AI processing failures
- Network connectivity issues

## Development Notes

- The frontend runs on port 5173 (Vite default)
- The backend runs on port 3001
- SQLite database file is created automatically in `database/receipts.db`
- Uploaded files are stored in the `uploads/` directory
- All API endpoints include proper CORS headers for development

## Production Considerations

Before deploying to production:

1. **Environment Variables**: Secure your Gemini API key
2. **File Storage**: Consider cloud storage for uploaded files
3. **Database**: Consider PostgreSQL or MySQL for production
4. **Security**: Add authentication and authorization
5. **Monitoring**: Add logging and error tracking
6. **Performance**: Add caching and rate limiting

## Troubleshooting

**Common Issues:**

1. **"Gemini API key not configured"**
   - Ensure you've added GEMINI_API_KEY to your .env file
   - Restart the backend server after adding the key

2. **"Failed to connect to backend"**
   - Verify backend server is running on port 3001
   - Check for any error messages in the backend console

3. **"PDF contains no readable text"**
   - Try a different PDF file
   - Ensure the PDF contains actual text (not just images)

4. **Database errors**
   - Check file permissions in the `database/` directory
   - Restart the backend to reinitialize the database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for educational and assessment purposes.# pdf_extraction_gemini
