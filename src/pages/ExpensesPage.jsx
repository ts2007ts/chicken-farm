import { EXPENSE_CATEGORIES } from '../constants'
import { formatNumber, formatDate } from '../utils/helpers'

function ExpensesPage({ 
  transactions, 
  totalExpenses,
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">المصروفات والإضافات</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
          >
            إضافة مصروف
          </button>
          <button
            onClick={() => setShowContributionModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all"
          >
            إضافة للرأسمال
          </button>
        </div>
      </div>

      {/* Expense Summary by Category */}
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
          <span className="text-sm text-gray-500">إجمالي: {transactions.length} معاملة</span>
        </div>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد معاملات بعد</p>
        ) : (
          <>
            <div className="space-y-2">
              {transactions
                .slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage)
                .map(transaction => (
                <div key={transaction.id} className={`flex items-center justify-between p-4 rounded-lg ${
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
                      <p className="font-medium text-gray-800">
                        {transaction.type === 'expense' 
                          ? EXPENSE_CATEGORIES.find(c => c.id === transaction.category)?.name
                          : transaction.type === 'settlement'
                          ? `تصفية ${transaction.investorName} (${transaction.settlementType === 'receive' ? 'استلام' : 'دفع'})`
                          : `إضافة من ${transaction.investorName}`}
                      </p>
                      <p className="text-sm text-gray-500">{transaction.note}</p>
                      <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'expense' ? 'text-red-600' : 
                        transaction.type === 'settlement' ? 'text-purple-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'expense' ? '-' : 
                         transaction.type === 'settlement' ? '⚖️ ' : '+'}{formatNumber(transaction.amount)} ل.س
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {transactions.length > transactionsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ««
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  «
                </button>
                <span className="px-4 py-1 text-sm text-gray-600">
                  صفحة {currentPage} من {Math.ceil(transactions.length / transactionsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(transactions.length / transactionsPerPage)))}
                  disabled={currentPage === Math.ceil(transactions.length / transactionsPerPage)}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  »
                </button>
                <button
                  onClick={() => setCurrentPage(Math.ceil(transactions.length / transactionsPerPage))}
                  disabled={currentPage === Math.ceil(transactions.length / transactionsPerPage)}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  »»
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ExpensesPage
