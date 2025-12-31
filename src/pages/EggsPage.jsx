import { FAMILIES } from '../constants'
import { formatNumber, formatDate } from '../utils/helpers'

function EggsPage({ 
  eggs, 
  totalEggs,
  getFamilyEggs,
  setShowEggModal,
  handleDeleteEgg
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">سجل البيض</h2>
        <button
          onClick={() => setShowEggModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-all"
        >
          تسجيل بيض جديد
        </button>
      </div>

      {/* Egg Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">توزيع البيض على العائلات</h3>
        <div className="text-center mb-6">
          <span className="text-5xl">🥚</span>
          <p className="text-3xl font-bold text-amber-600 mt-2">{formatNumber(totalEggs)}</p>
          <p className="text-gray-500">إجمالي البيض</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FAMILIES.map(family => (
            <div key={family.id} className="bg-amber-50 rounded-lg p-4 text-center">
              <span className="text-3xl">{family.icon}</span>
              <p className="font-bold text-gray-800 mt-2">{family.name}</p>
              <p className="text-2xl font-bold text-amber-600">{formatNumber(getFamilyEggs(family.id))}</p>
              <p className="text-sm text-gray-500">بيضة (33.33%)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Egg Records */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">سجل إنتاج البيض</h3>
        {eggs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا يوجد سجل للبيض بعد</p>
        ) : (
          <div className="space-y-2">
            {eggs.map(egg => (
              <div key={egg.id} className="flex items-center justify-between p-4 rounded-lg bg-amber-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥚</span>
                  <div>
                    <p className="font-medium text-gray-800">{formatNumber(egg.quantity)} بيضة</p>
                    <p className="text-sm text-gray-500">{egg.note}</p>
                    <p className="text-xs text-gray-400">{formatDate(egg.date)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEgg(egg.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EggsPage
