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
  categories,
  families,
  getInvestorShare,
  getInvestorBalance,
  getInvestorContributions,
  getInvestorSettlementsPaid,
  getInvestorSettlementsReceived,
  getFamilyEggs,
  selectedInvestorForDetails,
  setSelectedInvestorForDetails,
  isAdmin,
  userProfile,
  chickenInventory = [],
  feedInventory = [],
  archives = [],
  onAddChicken,
  onAddFeed,
  onArchiveCycle,
  onDeleteChicken,
  onDeleteFeed
}) {
  const { t, language } = useLanguage()

  const currentChickenCount = chickenInventory.reduce((sum, item) => {
    if (item.type === 'initial' || item.type === 'buy') return sum + item.quantity
    if (item.type === 'death') return sum - item.quantity
    return sum
  }, 0)

  const currentFeedStock = feedInventory.reduce((sum, item) => {
    if (item.type === 'buy') return sum + item.quantity
    if (item.type === 'consume') return sum - item.quantity
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t?.inventory?.title || 'Inventory'}</h2>

      {/* Assets Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chicken Inventory Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>🐔</span> {t?.eggs?.chicken?.title || 'Chicken'}
            </h3>
            {isAdmin() && (
              <button 
                onClick={onAddChicken}
                className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-amber-200"
              >
                + {t?.common?.add || 'Add'}
              </button>
            )}
          </div>
          <div className="text-3xl font-bold text-amber-600 mb-2">
            {formatNumber(currentChickenCount)} <span className="text-sm text-gray-500 font-normal">{language === 'ar' ? 'دجاجة' : 'Chicken'}</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {chickenInventory.map(item => (
              <div key={item.id} className="flex justify-between text-sm border-b border-gray-50 py-1">
                <span className="text-gray-600">{formatDate(item.date)} - {t?.eggs?.chicken?.[item.type] || item.type}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${item.type === 'death' ? 'text-red-500' : 'text-green-600'}`}>
                    {item.type === 'death' ? '-' : '+'}{item.quantity}
                  </span>
                  {isAdmin() && (
                    <button onClick={() => onDeleteChicken(item.id)} className="text-red-300 hover:text-red-500">×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Inventory Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>🌾</span> {t?.eggs?.feed?.title || 'Feed'}
            </h3>
            {isAdmin() && (
              <button 
                onClick={onAddFeed}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-blue-200"
              >
                + {t?.common?.add || 'Add'}
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-3xl font-bold text-blue-600">
              {formatNumber(currentFeedStock)} <span className="text-sm text-gray-500 font-normal">{language === 'ar' ? 'كغ' : 'kg'}</span>
            </div>
            {currentFeedStock < 50 && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse font-bold">
                {t?.eggs?.feed?.alert || 'Low stock!'}
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {feedInventory.map(item => (
              <div key={item.id} className="flex justify-between text-sm border-b border-gray-50 py-1">
                <span className="text-gray-600">{formatDate(item.date)} - {t?.eggs?.feed?.[item.type] || item.type}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${item.type === 'consume' ? 'text-red-500' : 'text-green-600'}`}>
                    {item.type === 'consume' ? '-' : '+'}{item.quantity}
                  </span>
                  {isAdmin() && (
                    <button onClick={() => onDeleteFeed(item.id)} className="text-red-300 hover:text-red-500">×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cycle Archiving */}
      <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span>📦</span> {t?.eggs?.archives?.title || 'Archives'}
          </h3>
          {isAdmin() && (
            <button 
              onClick={onArchiveCycle}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 flex items-center gap-2"
            >
              <span>🔒</span> {t?.eggs?.archives?.archiveNow || 'Archive Now'}
            </button>
          )}
        </div>

        {archives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archives.map(archive => (
              <div key={archive.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">{archive.name}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t?.eggs?.archives?.archivedAt || 'Archived At'}:</span>
                    <span className="font-medium">{formatDate(archive.archivedAt?.toDate?.() || archive.archivedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t?.eggs?.archives?.investors || 'Investors'}:</span>
                    <span className="font-medium">{archive.investorCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t?.eggs?.archives?.capital || 'Capital'}:</span>
                    <span className="font-medium">{formatNumber(archive.totalInitialCapital)} {t?.common?.currency || ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">{t?.eggs?.archives?.noArchives || 'No archives yet'}</p>
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t?.inventory?.financialSummary || 'Financial Summary'}</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">{t?.inventory?.totalInitialCapital || 'Total Capital'}</span>
            <span className="font-bold text-green-600">{formatNumber(totalInitialCapital)} {t?.common?.currency || ''}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-gray-700">{t?.inventory?.totalContributions || 'Total Contributions'}</span>
            <span className="font-bold text-blue-600">+{formatNumber(totalContributions)} {t?.common?.currency || ''}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-gray-700">{t?.inventory?.totalExpenses || 'Total Expenses'}</span>
            <span className="font-bold text-red-600">-{formatNumber(totalExpenses)} {t?.common?.currency || ''}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-gray-700">{t?.inventory?.settlementsIn || 'Settlements In'}</span>
            <span className="font-bold text-purple-600">+{formatNumber(totalSettlementsIn)} {t?.common?.currency || ''}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-gray-700">{t?.inventory?.settlementsOut || 'Settlements Out'}</span>
            <span className="font-bold text-purple-600">-{formatNumber(totalSettlementsOut)} {t?.common?.currency || ''}</span>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2 font-medium">{t?.inventory?.calculationMethod || 'Calculation'}:</p>
            <p className="text-xs text-gray-500 font-mono">
              {formatNumber(totalInitialCapital)} + {formatNumber(totalContributions)} - {formatNumber(totalExpenses)} + {formatNumber(totalSettlementsIn)} - {formatNumber(totalSettlementsOut)} = {balance < 0 ? `(${formatNumber(Math.abs(balance))})` : formatNumber(balance)}
            </p>
          </div>
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border-2 border-amber-300">
            <span className="text-gray-800 font-bold">{t?.inventory?.currentBalance || 'Current Balance'}</span>
            <span className={`font-bold text-2xl ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>{balance < 0 ? `(${formatNumber(Math.abs(balance))})` : formatNumber(balance)} {t?.common?.currency || ''}</span>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t?.inventory?.expenseBreakdown || 'Expense Breakdown'}</h3>
        <div className="space-y-3">
          {categories.map(category => {
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
                    <span className="font-medium text-gray-800">{formatNumber(categoryTotal)} {t?.common?.currency || ''}</span>
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
        <h3 className="font-bold text-gray-800 mb-4">{t?.inventory?.investorShares || 'Investor Shares'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-gray-600">{t?.superAdmin?.investorName || 'Investor'}</th>
                <th className="text-right py-3 px-4 text-gray-600">{t?.investors?.initialCapital || 'Capital'}</th>
                <th className="text-right py-3 px-4 text-gray-600">{t?.investors?.shareRatio || 'Share %'}</th>
                <th className="text-right py-3 px-4 text-gray-600">{t?.investors?.expectedBalance || 'Balance'}</th>
              </tr>
            </thead>
            <tbody>
              {investors.map(investor => (
                <tr key={investor.id} className="border-b border-gray-100 hover:bg-amber-50">
                  <td className="py-3 px-4 font-medium">{investor.name}</td>
                  <td className="py-3 px-4">{formatNumber(investor.initialCapital)} {t?.common?.currency || ''}</td>
                  <td className="py-3 px-4 text-amber-600 font-bold">{getInvestorShare(investor)}%</td>
                  <td className={`py-3 px-4 font-bold ${formatBalance(getInvestorBalance(investor)).isNegative ? 'text-red-600' : 'text-green-600'}`}>{formatBalance(getInvestorBalance(investor)).text} {t?.common?.currency || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investor Calculation Details */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t?.inventory?.calculationDetails || 'Details'}</h3>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">{t?.inventory?.selectInvestor || 'Select Investor'}:</label>
          <select
            value={selectedInvestorForDetails || ''}
            onChange={(e) => setSelectedInvestorForDetails(e.target.value ? e.target.value : null)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            disabled={!isAdmin() && userProfile?.investorId}
          >
            <option value="">{t?.inventory?.selectInvestorPlaceholder || '-- Select --'}</option>
            {(isAdmin() ? investors : investors.filter(inv => inv.id === userProfile?.investorId)).map(inv => (
              <option key={inv.id} value={inv.id}>{inv.name}</option>
            ))}
          </select>
          {!isAdmin() && (
            <p className="text-xs text-gray-400 mt-1">{t?.inventory?.onlyYourDetails || ''}</p>
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
                <p className="text-gray-500">{t?.investors?.shareRatio || 'Share'}: {getInvestorShare(investor)}%</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 space-y-3">
                <h5 className="font-bold text-gray-700 border-b pb-2">{t?.inventory?.calculationDetails || 'Details'}:</h5>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">1️⃣ {t?.investors?.initialCapital || 'Capital'}</span>
                  <span className="font-bold text-green-600">+{formatNumber(investor.initialCapital)} {t?.common?.currency || ''}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">2️⃣ {t?.dashboard?.expenses || 'Expenses'} ({formatNumber(totalExpenses)} ÷ {investorCount} {t?.investors?.title || 'Investors'})</span>
                  <span className="font-bold text-red-600">-{formatNumber(expensePerPerson)} {t?.common?.currency || ''}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">3️⃣ {t?.dashboard?.contributions || 'Contributions'}</span>
                  <span className="font-bold text-blue-600">+{formatNumber(contributions)} {t?.common?.currency || ''}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">4️⃣ {t?.investors?.settlePay || 'Settlement Pay'}</span>
                  <span className="font-bold text-purple-600">+{formatNumber(settlementsPaid)} {t?.common?.currency || ''}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">5️⃣ {t?.investors?.settleReceive || 'Settlement Receive'}</span>
                  <span className="font-bold text-purple-600">-{formatNumber(settlementsReceived)} {t?.common?.currency || ''}</span>
                </div>
                
                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-600 font-medium mb-1">{t?.inventory?.equation || 'Equation'}:</p>
                    <p className="text-xs text-gray-700 font-mono">
                      {formatNumber(investor.initialCapital)} - {formatNumber(expensePerPerson)} + {formatNumber(contributions)} + {formatNumber(settlementsPaid)} - {formatNumber(settlementsReceived)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-bold text-lg">{t?.inventory?.finalBalance || 'Final Balance'}</span>
                    <span className={`font-bold text-2xl ${finalBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {finalBalance < 0 ? `(${formatNumber(Math.abs(finalBalance))})` : formatNumber(finalBalance)} {t?.common?.currency || ''}
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
        <h3 className="font-bold text-gray-800 mb-4">{t?.inventory?.familyEggShares || 'Family Shares'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {families.length > 0 ? families.map(family => (
            <div key={family.id} className="bg-amber-50 rounded-lg p-4 text-center">
              <span className="text-3xl">{family.icon}</span>
              <p className="font-bold text-gray-800 mt-2">{family.name}</p>
              <p className="text-2xl font-bold text-amber-600">{formatNumber(getFamilyEggs(family.id))}</p>
              <p className="text-sm text-gray-500">{t?.eggs?.egg || 'Egg'} ({((100 / families.length) || 0).toFixed(2)}%)</p>
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
