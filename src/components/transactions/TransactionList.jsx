import { formatNumber, formatDate } from '../../utils/helpers'
import { EXPENSE_CATEGORIES } from '../../constants'

function TransactionList({ 
  transactions,
  filteredTransactions,
  filterDate,
  setFilterDate,
  filterCategory,
  setFilterCategory,
  filterAmount,
  setFilterAmount,
  filterNotes,
  setFilterNotes,
  currentPage,
  setCurrentPage,
  transactionsPerPage,
  setShowExpenseModal,
  setShowContributionModal,
  setEditingTransaction,
  handleDeleteTransaction
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">المصروفات والإضافات</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setShowExpenseModal(true)} className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base">
            إضافة مصروف
          </button>
          <button onClick={() => setShowContributionModal(true)} className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base">
            إضافة للرأسمال
          </button>
        </div>
      </div>

      {/* Expense Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">ملخص المصروفات حسب الفئة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EXPENSE_CATEGORIES.map(category => {
            const categoryTotal = transactions
              .filter(t => t.type === 'expense' && t.category === category.id)
              .reduce((sum, t) => sum + t.amount, 0)
            return (
              <div key={category.id} className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-2xl">{category.icon}</span>
                <p className="text-sm text-gray-600 mt-1">{category.name}</p>
                <p className="font-bold text-red-600">{formatNumber(categoryTotal)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">سجل المعاملات</h3>
          <span className="text-sm text-gray-500">إجمالي: {filteredTransactions.length} معاملة</span>
        </div>
        
        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-700 mb-3">الفلاتر</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">التاريخ</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">الفئة</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">جميع الفئات</option>
                <option value="expense">مصروفات</option>
                <option value="contribution">إضافات</option>
                <option value="settlement">تصفيات</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">المبلغ</label>
              <input
                type="number"
                value={filterAmount}
                onChange={(e) => setFilterAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">الملاحظة</label>
              <input
                type="text"
                value={filterNotes}
                onChange={(e) => setFilterNotes(e.target.value)}
                placeholder="بحث في الملاحظات وأسماء المستثمرين"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterDate('')
                  setFilterCategory('all')
                  setFilterAmount('')
                  setFilterNotes('')
                }}
                className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد معاملات مطابقة للفلاتر</p>
        ) : (
          <>
            <div className="space-y-2">
              {filteredTransactions
                .slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage)
                .map(transaction => (
                <div key={transaction.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-2 sm:gap-0 ${
                  transaction.type === 'expense' ? 'bg-red-50' : 
                  transaction.type === 'settlement' ? 'bg-purple-50' : 'bg-green-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {transaction.type === 'expense' 
                        ? EXPENSE_CATEGORIES.find(c => c.id === transaction.category)?.icon || '📦'
                        : transaction.type === 'settlement'
                        ? (transaction.settlementType === 'receive' ? '💰' : '💳')
                        : '➕'}
                    </span>
                    <div>
                      <p className="font-bold text-gray-800">
                        {transaction.type === 'expense' 
                          ? EXPENSE_CATEGORIES.find(c => c.id === transaction.category)?.name
                          : transaction.type === 'settlement'
                          ? `تصفية ${transaction.investorName} (${transaction.settlementType === 'receive' ? 'استلام' : 'دفع'})`
                          : `إضافة من ${transaction.investorName}`}
                      </p>
                      <p className="text-sm text-gray-500">{transaction.note}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left">
                      <p className={`font-bold text-base sm:text-lg ${
                        transaction.type === 'expense' ? 'text-red-600' : 
                        transaction.type === 'settlement' ? 'text-purple-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'expense' ? '-' : 
                         transaction.type === 'settlement' ? '⚖️ ' : '+'}{formatNumber(transaction.amount)} ل.س
                      </p>
                    </div>
                    <button onClick={() => setEditingTransaction(transaction)} className="text-gray-400 hover:text-blue-500 transition-colors">✏️</button>
                    <button onClick={() => handleDeleteTransaction(transaction.id)} className="text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {filteredTransactions.length > transactionsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">««</button>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">«</button>
                <span className="px-4 py-1 text-sm text-gray-600">صفحة {currentPage} من {Math.ceil(filteredTransactions.length / transactionsPerPage)}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredTransactions.length / transactionsPerPage)))} disabled={currentPage === Math.ceil(filteredTransactions.length / transactionsPerPage)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">»</button>
                <button onClick={() => setCurrentPage(Math.ceil(filteredTransactions.length / transactionsPerPage))} disabled={currentPage === Math.ceil(filteredTransactions.length / transactionsPerPage)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">»»</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TransactionList
