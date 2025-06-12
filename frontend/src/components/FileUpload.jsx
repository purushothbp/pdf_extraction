import { useState } from 'react';

const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError('');
    setMessage('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      const response = await fetch('https://pdf-extraction-k1hw.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result.fileId;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const validateFile = async (fileId) => {
    setValidating(true);
    
    try {
      const response = await fetch('https://pdf-extraction-k1hw.onrender.com/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Validation failed');
      }

      if (!result.isValid) {
        throw new Error(result.invalidReason || 'File is not a valid PDF');
      }

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setValidating(false);
    }
  };

  const processFileAI = async (fileId) => {
    setProcessing(true);
    
    try {
      const response = await fetch('https://pdf-extraction-k1hw.onrender.com/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Processing failed');
      }

      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setMessage('Uploading receipt...');
    const fileId = await uploadFile();
    
    if (!fileId) return;

    setMessage('Validating document...');
    const isValid = await validateFile(fileId);
    
    if (!isValid) return;

    setMessage('Processing with AI...');
    const result = await processFileAI(fileId);
    
    if (result) {
      setMessage('Receipt processed successfully!');
      setSelectedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const isLoading = uploading || validating || processing;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Upload Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Upload Receipt
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Drop your PDF receipt here or click to browse
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-blue-400 bg-blue-50/50'
              : selectedFile
              ? 'border-green-400 bg-green-50/50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          {selectedFile ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl mx-auto flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedFile.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 font-medium text-sm sm:text-base">Choose a PDF file</p>
                <p className="text-xs sm:text-sm text-gray-400">or drag and drop it here</p>
              </div>
            </div>
          )}
        </div>

        {/* Process Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isLoading}
          className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">
                {uploading && 'Uploading...'}
                {validating && 'Validating...'}
                {processing && 'Processing with AI...'}
              </span>
            </div>
          ) : (
            <span className="text-sm sm:text-base">Process Receipt</span>
          )}
        </button>

        {/* Status Messages */}
        {message && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-800 font-medium text-xs sm:text-sm">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-800 font-medium text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
