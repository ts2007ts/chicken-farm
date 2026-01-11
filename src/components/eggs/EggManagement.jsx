import { formatNumber, formatDate } from '../../utils/helpers'
import { FAMILIES } from '../../constants'
import { useLanguage } from '../../contexts/LanguageContext'

function EggManagement({ 
  totalEggs, 
  getInvestorEggs,
  getFamilyEggs, 
  eggs, 
  families,
  isAdmin, 
  handleDeleteEgg, 
  handleConfirmEggDelivery, 
  handleRejectEggDelivery,
  setShowEggModal 
}) {
  const { t, language } = useLanguage()

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t.eggs.title}</h2>
        <button onClick={() => setShowEggModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base w-full sm:w-auto">
          {t.eggs.recordNew}
        </button>
      </div>

      {/* Egg Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 md:p-10">
        <h3 className="font-bold text-gray-800 mb-4">{t.eggs.distribution}</h3>
        <div className="text-center mb-6">
          <span className="text-5xl">🥚</span>
          <p className="text-3xl font-bold text-amber-600 mt-2">{formatNumber(totalEggs)}</p>
          <p className="text-gray-500">{t.eggs.totalEggs}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {families.length > 0 ? (
            families.map(family => (
              <div key={family.id} className="bg-amber-50 rounded-lg p-4 text-center">
                <span className="text-3xl">{family.icon}</span>
                <p className="font-bold text-gray-800 mt-2">{family.name}</p>
                <p className="text-2xl font-bold text-amber-600">{formatNumber(getFamilyEggs(family.id))}</p>
                <p className="text-sm text-gray-500">{t.eggs.egg} ({((100 / families.length) || 0).toFixed(2)}%)</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full py-4">No family distribution data yet.</p>
          )}
        </div>
      </div>

      {/* Egg Records */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t.eggs.eggProductionHistory}</h3>
        {eggs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t.eggs.noRecords}</p>
        ) : (
          <div className="space-y-4">
            {eggs.map(egg => (
              <div key={egg.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-amber-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥚</span>
                    <div>
                      <p className="font-bold text-gray-800">{formatNumber(egg.quantity)} {t.eggs.egg}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(egg.date, language)} - {egg.note || (language === 'ar' ? 'بدون ملاحظات' : 'No notes')}
                        {egg.recordedBy && <span className="mr-2 text-amber-700 font-medium">| {t.eggs.recordedBy}: {egg.recordedBy}</span>}
                      </p>
                    </div>
                  </div>
                  {isAdmin() && (
                    <button onClick={() => handleDeleteEgg(egg.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors" title={t.common.delete}>🗑️</button>
                  )}
                </div>
                {/* Simplified delivery display if families are empty */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {families.map(family => {
                    const delivery = egg.deliveries?.[family.id]
                    const isDelivered = delivery?.status === 'delivered' || delivery?.delivered === true
                    const isRejected = delivery?.status === 'rejected'
                    return (
                      <div key={family.id} className={`p-3 rounded-lg border ${
                        isDelivered ? 'bg-green-50 border-green-100' : 
                        isRejected ? 'bg-red-50 border-red-100' : 
                        'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{family.icon}</span>
                            <span className="text-sm font-bold text-gray-700">{family.name}</span>
                          </div>
                          {isDelivered ? (
                            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">{t.eggs.delivered}</span>
                          ) : isRejected ? (
                            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">{t.eggs.rejectDelivery}</span>
                          ) : (
                            <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">{t.eggs.pending}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 mb-3">
                          {isDelivered ? (
                            <>
                              <p>{t.eggs.recipient}: {delivery.deliveredBy || delivery.confirmedBy}</p>
                              <p>{t.common.date}: {formatDate(delivery.deliveredAt, language)}</p>
                            </>
                          ) : isRejected ? (
                            <>
                              <p className="text-red-600 font-bold">{t.common.amount}: {formatNumber(delivery.cashValue)} {t.common.currency}</p>
                              <p>{t.common.date}: {formatDate(delivery.rejectedAt, language)}</p>
                            </>
                          ) : (
                            <p>{t.common.amount}: {formatNumber(Math.floor(egg.quantity / Math.max(1, egg.familyCountAtProduction || families.length)))} {t.eggs.egg}</p>
                          )}
                        </div>
                        {!isDelivered && !isRejected && isAdmin() && (
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => handleConfirmEggDelivery(egg.id, family.id)}
                              className="w-full bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-md text-xs font-bold transition-all"
                            >
                              {t.eggs.confirmDelivery}
                            </button>
                            <button 
                              onClick={() => handleRejectEggDelivery(egg.id, family.id)}
                              className="w-full bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-md text-xs font-bold transition-all"
                            >
                              {t.eggs.rejectDelivery}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EggManagement
