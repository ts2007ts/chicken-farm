import { formatNumber, formatDate, formatBalance } from '../../utils/helpers'
import { EXPENSE_CATEGORIES, FAMILIES } from '../../constants'
import { useLanguage } from '../../contexts/LanguageContext'

function InventoryTab({
  totalInitialCapital,
  totalContributions,
  totalExpenses,
  totalSettlementsIn,
  totalSettlementsOut,
  balance,
  transactions,
  investors,
  getInvestorShare,
  getInvestorBalance,
  getInvestorContributions,
  getInvestorSettlementsPaid,
  getInvestorSettlementsReceived,
  getFamilyEggs,
  selectedInvestorForDetails,
  setSelectedInvestorForDetails,
  isAdmin,
  userProfile
}) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t.inventory.title}</h2>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t.inventory.financialSummary}</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">{t.inventory.totalInitialCapital}</span>
            <span className="font-bold text-green-600">{formatNumber(totalInitialCapital)} {t.common.currency}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-gray-700">{t.inventory.totalContributions}</span>
            <span className="font-bold text-blue-600">+{formatNumber(totalContributions)} {t.common.currency}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-gray-700">{t.inventory.totalExpenses}</span>
            <span className="font-bold text-red-600">-{formatNumber(totalExpenses)} {t.common.currency}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-gray-700">{t.inventory.settlementsIn}</span>
            <span className="font-bold text-purple-600">+{formatNumber(totalSettlementsIn)} {t.common.currency}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-gray-700">{t.inventory.settlementsOut}</span>
            <span className="font-bold text-purple-600">-{formatNumber(totalSettlementsOut)} {t.common.currency}</span>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2 font-medium">{t.inventory.calculationMethod}:</p>
            <p className="text-xs text-gray-500 font-mono">
              {formatNumber(totalInitialCapital)} + {formatNumber(totalContributions)} - {formatNumber(totalExpenses)} + {formatNumber(totalSettlementsIn)} - {formatNumber(totalSettlementsOut)} = {balance < 0 ? `(${formatNumber(Math.abs(balance))})` : formatNumber(balance)}
            </p>
          </div>
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border-2 border-amber-300">
            <span className="text-gray-800 font-bold">{t.inventory.currentBalance}</span>
            <span className={`font-bold text-2xl ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>{balance < 0 ? `(${formatNumber(Math.abs(balance))})` : formatNumber(balance)} {t.common.currency}</span>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t.inventory.expenseBreakdown}</h3>
        <div className="space-y-3">
          {EXPENSE_CATEGORIES(t).map(category => {
            const categoryTotal = transactions
              .filter(t => t.type === 'expense' && t.category === category.id)
              .reduce((sum, t) => sum + t.amount, 0)
            const percentage = totalExpenses > 0 ? ((categoryTotal / totalExpenses) * 100).toFixed(1) : 0
            return (
              <div key={category.id} className="flex items-center gap-4">
                <span className="text-2xl w-10">{category.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{category.name}</span>
                    <span className="font-medium text-gray-800">{formatNumber(categoryTotal)} {t.common.currency}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-left">{percentage}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Investor Shares Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t.inventory.investorShares}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-gray-600">{t.superAdmin.investorName}</th>
                <th className="text-right py-3 px-4 text-gray-600">{t.investors.initialCapital}</th>
                <th className="text-right py-3 px-4 text-gray-600">{t.investors.shareRatio}</th>
                <th className="text-right py-3 px-4 text-gray-600">{t.investors.expectedBalance}</th>
              </tr>
            </thead>
            <tbody>
              {investors.map(investor => (
                <tr key={investor.id} className="border-b border-gray-100 hover:bg-amber-50">
                  <td className="py-3 px-4 font-medium">{investor.name}</td>
                  <td className="py-3 px-4">{formatNumber(investor.initialCapital)} {t.common.currency}</td>
                  <td className="py-3 px-4 text-amber-600 font-bold">{getInvestorShare(investor)}%</td>
                  <td className={`py-3 px-4 font-bold ${formatBalance(getInvestorBalance(investor)).isNegative ? 'text-red-600' : 'text-green-600'}`}>{formatBalance(getInvestorBalance(investor)).text} {t.common.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investor Calculation Details */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t.inventory.calculationDetails}</h3>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">{t.inventory.selectInvestor}:</label>
          <select
            value={selectedInvestorForDetails || ''}
            onChange={(e) => setSelectedInvestorForDetails(e.target.value ? e.target.value : null)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            disabled={!isAdmin() && userProfile?.investorId}
          >
            <option value="">{t.inventory.selectInvestorPlaceholder}</option>
            {(isAdmin() ? investors : investors.filter(inv => inv.id === userProfile?.investorId)).map(inv => (
              <option key={inv.id} value={inv.id}>{inv.name}</option>
            ))}
          </select>
          {!isAdmin() && (
            <p className="text-xs text-gray-400 mt-1">{t.inventory.onlyYourDetails}</p>
          )}
        </div>
        
        {selectedInvestorForDetails && (() => {
          const investor = investors.find(inv => String(inv.id) === String(selectedInvestorForDetails))
          if (!investor) return null
          const investorCount = investors.filter(inv => inv.initialCapital > 0).length || 1
          const expensePerPerson = totalExpenses / investorCount
          const contributions = getInvestorContributions(investor.id)
          const settlementsPaid = getInvestorSettlementsPaid(investor.id)
          const settlementsReceived = getInvestorSettlementsReceived(investor.id)
          const finalBalance = parseFloat(getInvestorBalance(investor))
          
          return (
            <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                  {investor.name.charAt(0)}
                </div>
                <h4 className="text-xl font-bold text-gray-800">{investor.name}</h4>
                <p className="text-gray-500">{t.investors.shareRatio}: {getInvestorShare(investor)}%</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 space-y-3">
                <h5 className="font-bold text-gray-700 border-b pb-2">{t.inventory.calculationDetails}:</h5>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">1️⃣ {t.investors.initialCapital}</span>
                  <span className="font-bold text-green-600">+{formatNumber(investor.initialCapital)} {t.common.currency}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">2️⃣ {t.dashboard.expenses} ({formatNumber(totalExpenses)} ÷ {investorCount} {t.investors.title})</span>
                  <span className="font-bold text-red-600">-{formatNumber(expensePerPerson)} {t.common.currency}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">3️⃣ {t.dashboard.contributions}</span>
                  <span className="font-bold text-blue-600">+{formatNumber(contributions)} {t.common.currency}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">4️⃣ {t.inventory.settlementsIn}</span>
                  <span className="font-bold text-purple-600">+{formatNumber(settlementsPaid)} {t.common.currency}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">5️⃣ {t.inventory.settlementsOut}</span>
                  <span className="font-bold text-purple-600">-{formatNumber(settlementsReceived)} {t.common.currency}</span>
                </div>
                
                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-600 font-medium mb-1">{t.inventory.equation}:</p>
                    <p className="text-xs text-gray-700 font-mono">
                      {formatNumber(investor.initialCapital)} - {formatNumber(expensePerPerson)} + {formatNumber(contributions)} + {formatNumber(settlementsPaid)} - {formatNumber(settlementsReceived)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-bold text-lg">{t.inventory.finalBalance}</span>
                    <span className={`font-bold text-2xl ${finalBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {finalBalance < 0 ? `(${formatNumber(Math.abs(finalBalance))})` : formatNumber(finalBalance)} {t.common.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Family Egg Shares */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t.inventory.familyEggShares}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FAMILIES(t).length > 0 ? FAMILIES(t).map(family => (
            <div key={family.id} className="bg-amber-50 rounded-lg p-4 text-center">
              <span className="text-3xl">{family.icon}</span>
              <p className="font-bold text-gray-800 mt-2">{family.name}</p>
              <p className="text-2xl font-bold text-amber-600">{formatNumber(getFamilyEggs(family.id))}</p>
              <p className="text-sm text-gray-500">{t.eggs.egg} (33.33%)</p>
            </div>
          )) : (
            <p className="text-gray-500 text-center col-span-full py-4">No family distribution data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryTab
