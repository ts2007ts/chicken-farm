import { EXPENSE_CATEGORIES } from '../constants'
import { formatNumber, formatDate, formatBalance } from '../utils/helpers'

function DashboardPage({ 
  investors, 
  transactions, 
  balance, 
  totalInitialCapital, 
  totalContributions, 
  totalExpenses, 
  totalEggs,
  getInvestorShare,
  getInvestorBalance,
  getInvestorEggs,
  setShowCapitalModal,
  setShowExpenseModal,
  setShowContributionModal,
  setShowEggModal
}) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
          <p className="text-green-100 text-sm">رأس المال</p>
          <p className="text-2xl font-bold">{formatNumber(totalInitialCapital)}</p>
          <p className="text-green-200 text-xs">ل.س</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-4 text-white">
          <p className="text-red-100 text-sm">المصروفات</p>
          <p className="text-2xl font-bold">{formatNumber(totalExpenses)}</p>
          <p className="text-red-200 text-xs">ل.س</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-sm">الإضافات</p>
          <p className="text-2xl font-bold">{formatNumber(totalContributions)}</p>
          <p className="text-blue-200 text-xs">ل.س</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-4 text-white">
          <p className="text-amber-100 text-sm">إجمالي البيض</p>
          <p className="text-2xl font-bold">{formatNumber(totalEggs)}</p>
          <p className="text-amber-200 text-xs">بيضة</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCapitalModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg p-4 transition-all transform hover:scale-105"
          >
            <span className="text-2xl block mb-1">💵</span>
            <span className="text-sm">تعيين رأس المال</span>
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-4 transition-all transform hover:scale-105"
          >
            <span className="text-2xl block mb-1">📝</span>
            <span className="text-sm">إضافة مصروف</span>
          </button>
          <button
            onClick={() => setShowContributionModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 transition-all transform hover:scale-105"
          >
            <span className="text-2xl block mb-1">➕</span>
            <span className="text-sm">إضافة للرأسمال</span>
          </button>
          <button
            onClick={() => setShowEggModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg p-4 transition-all transform hover:scale-105"
          >
            <span className="text-2xl block mb-1">🥚</span>
            <span className="text-sm">تسجيل بيض</span>
          </button>
        </div>
      </div>

      {/* Investors Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">ملخص حصص المستثمرين</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {investors.map(investor => (
            <div key={investor.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">{investor.name}</span>
                <span className="text-amber-600 font-bold">{getInvestorShare(investor)}%</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>رأس المال: <span className="font-medium">{formatNumber(investor.initialCapital)}</span></p>
                <p>الرصيد: <span className={`font-medium ${formatBalance(getInvestorBalance(investor)).isNegative ? 'text-red-600' : 'text-green-600'}`}>{formatBalance(getInvestorBalance(investor)).text} ل.س</span></p>
                <p>البيض: <span className="font-medium text-amber-600">{formatNumber(getInvestorEggs(investor))}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">آخر المعاملات</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد معاملات بعد</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transactions.slice(0, 10).map(transaction => (
              <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-lg ${
                transaction.type === 'expense' ? 'bg-red-50' : 
                transaction.type === 'settlement' ? 'bg-purple-50' : 'bg-green-50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">
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
                    <p className="text-xs text-gray-500">{transaction.note}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold ${
                    transaction.type === 'expense' ? 'text-red-600' : 
                    transaction.type === 'settlement' ? 'text-purple-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : 
                     transaction.type === 'settlement' ? '⚖️ ' : '+'}{formatNumber(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
