import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReceiptList from './components/ReceiptList';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmOWZhZmIiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40 pointer-events-none"></div>
      
      <div className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="w-full pt-8  pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-xl rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-2 sm:mb-4 shadow-lg border border-white/20">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">AI-Powered Receipt Processing</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Receipt Intelligence
              </span>
            </h1>
            

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto mb-4 sm:mb-6 lg:mb-5">
              <div className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Smart Upload</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Drag and drop PDF receipts with automatic validation</p>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">AI Extraction</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Advanced AI extracts merchant, date, and amounts</p>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Data Management</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Organized storage and instant retrieval of all receipts</p>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 lg:mb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-start">
              {/* Upload Component */}
              <div className="xl:col-span-2 w-full">
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </div>
              
              {/* Process Flow */}
              <div className="xl:col-span-3 w-full">
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-white/20 h-full">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8 text-center">
                    How It Works
                  </h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs sm:text-sm">1</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Upload PDF Receipt</h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          Select your PDF receipt file or simply drag and drop it into the upload zone. 
                          Our system automatically validates the file format and integrity.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs sm:text-sm">2</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Smart Validation</h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          Advanced validation checks ensure your PDF is readable and contains extractable text content. 
                          Invalid or corrupted files are automatically flagged.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs sm:text-sm">3</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">AI Processing</h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          Our Gemini AI model analyzes the receipt content and extracts key information like 
                          merchant name, purchase date, and total amount with high accuracy.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs sm:text-sm">4</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Structured Storage</h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          Extracted data is automatically organized and stored in our database, 
                          making it instantly searchable and accessible for future reference.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Receipt List Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
          <ReceiptList refreshTrigger={refreshTrigger} />
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/20 bg-white/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Receipt Intelligence</span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Powered by cutting-edge AI technology for intelligent document processing
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;