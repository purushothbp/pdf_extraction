import { useState, useEffect } from 'react';

const ReceiptList = ({ refreshTrigger }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const fetchReceipts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${serverUrl}/receipts`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch receipts');
      }

      setReceipts(result.receipts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptDetails = async (id) => {
    try {
      const response = await fetch(`${serverUrl}/receipts/${id}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to load details');
      setSelectedReceipt(result.receipt);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [refreshTrigger]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-center h-24 sm:h-32">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium text-sm sm:text-base">Loading receipts...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Processed Receipts
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {receipts.length} {receipts.length === 1 ? 'receipt' : 'receipts'} processed
              </p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 sm:px-4 py-1 sm:py-2 rounded-xl font-semibold text-sm sm:text-base">
              {receipts.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 sm:p-6 bg-red-50 border-l-4 border-red-400 mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 rounded-xl">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {receipts.length === 0 ? (
          <div className="p-8 sm:p-12 lg:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No receipts yet</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
              Upload and process your first receipt to see it appear here. Your processed receipts will be displayed in this beautiful table.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Purchase Date
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {receipts.map((receipt, index) => (
                    <tr key={receipt.id} className="hover:bg-gray-50/30 transition-colors duration-200">
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[200px] text-sm sm:text-base">
                              {receipt.file_name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">PDF Document</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                        <div className="flex items-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {receipt.merchant_name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                        <span className="text-base sm:text-lg font-bold text-green-600">
                          {formatAmount(receipt.total_amount)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                        <span className="text-gray-900 font-medium text-sm sm:text-base">
                          {formatDate(receipt.purchased_at)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                        <span className="text-gray-500 text-sm sm:text-base">
                          {formatDate(receipt.created_at)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-right">
                        <button
                          onClick={() => fetchReceiptDetails(receipt.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden p-4 sm:p-6 space-y-3 sm:space-y-4">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{receipt.file_name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-green-600 flex-shrink-0 ml-2">
                      {formatAmount(receipt.total_amount)}
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Merchant:</span>
                      <span className="font-medium text-gray-900 truncate ml-2">{receipt.merchant_name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium text-gray-900">{formatDate(receipt.purchased_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchReceiptDetails(receipt.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Receipt Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md mx-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Receipt Details</h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{selectedReceipt.file_name}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">PDF Receipt Document</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Merchant
                    </label>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedReceipt.merchant_name || 'Unknown'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Total Amount
                    </label>
                    <p className="font-bold text-green-600 text-sm sm:text-lg">{formatAmount(selectedReceipt.total_amount)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Purchase Date
                  </label>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatDate(selectedReceipt.purchased_at)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Processed On
                  </label>
                  <p className="font-medium text-gray-700 text-sm sm:text-base">{formatDate(selectedReceipt.created_at)}</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptList;