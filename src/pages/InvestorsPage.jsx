import { formatNumber, formatBalance } from '../utils/helpers'

function InvestorsPage({ 
  investors, 
  getInvestorShare, 
  getInvestorBalance, 
  setShowCapitalModal,
  setSettlementInvestor
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">المستثمرين</h2>
        <button
          onClick={() => setShowCapitalModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-all"
        >
          تعديل رأس المال
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {investors.map(investor => (
          <div key={investor.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {investor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{investor.name}</h3>
                  <p className="text-gray-500 text-sm">نسبة الحصة: {getInvestorShare(investor)}%</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-gray-500 text-sm">رأس المال الحالي</p>
                <p className="text-xl font-bold text-amber-600">{formatNumber(investor.initialCapital)} ل.س</p>
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
            {parseFloat(getInvestorBalance(investor)) !== 0 && (
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

export default InvestorsPage
