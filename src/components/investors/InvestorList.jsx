import { formatNumber, formatBalance } from '../../utils/helpers'

function InvestorList({ 
  investors, 
  getInvestorShare, 
  getInvestorBalance, 
  setShowCapitalModal, 
  setSettlementInvestor, 
  isAdmin, 
  userProfile 
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">المستثمرين</h2>
        <button onClick={() => setShowCapitalModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base w-full sm:w-auto">
          تعيين رأس المال
        </button>
      </div>
      <div className="grid gap-4 sm:gap-6">
        {investors.map(investor => (
          <div key={investor.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  {investor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-800">{investor.name}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">نسبة الحصة: {getInvestorShare(investor)}%</p>
                </div>
              </div>
              <div className="text-right sm:text-left w-full sm:w-auto">
                <p className="text-gray-500 text-xs sm:text-sm">رأس المال الحالي</p>
                <p className="text-lg sm:text-xl font-bold text-amber-600">{formatNumber(investor.initialCapital)} ل.س</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-500 text-sm">رأس المال الأولي</p>
                <p className="font-bold text-gray-800">{formatNumber(investor.initialCapital)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">الرصيد المتوقع</p>
                <p className={`font-bold ${formatBalance(getInvestorBalance(investor)).isNegative ? 'text-red-600' : 'text-green-600'}`}>{formatBalance(getInvestorBalance(investor)).text} ل.س</p>
              </div>
            </div>
            {parseFloat(getInvestorBalance(investor)) !== 0 && (isAdmin() || userProfile?.investorId === investor.id) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSettlementInvestor(investor)}
                  className={`w-full py-2 rounded-lg font-bold transition-all ${
                    parseFloat(getInvestorBalance(investor)) > 0
                      ? 'bg-green-100 hover:bg-green-200 text-green-700'
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  {parseFloat(getInvestorBalance(investor)) > 0
                    ? '💰 تصفية (استلام من الصندوق)'
                    : '💳 تصفية (دفع للصندوق)'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default InvestorList
