import { useState, useEffect } from 'react'
import { subscribeToLogs } from '../../firebase/firestore'
import { formatNumber, formatDate } from '../../utils/helpers'
import { useLanguage } from '../../contexts/LanguageContext'

function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()

  useEffect(() => {
    const unsubscribe = subscribeToLogs((data) => {
      setLogs(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const getLogIcon = (type) => {
    switch (type) {
      case 'set_capital': return '💰'
      case 'add_expense': return '💸'
      case 'add_contribution': return '📈'
      case 'add_eggs': return '🥚'
      case 'delete_transaction': return '🗑️'
      default: return '📝'
    }
  }

  if (loading) return <div className="p-4 text-center">{t.common.loading}</div>

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          🕒 {language === 'ar' ? 'سجل النشاطات' : 'Activity Logs'}
        </h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {language === 'ar' ? 'لا توجد نشاطات مسجلة بعد' : 'No activities recorded yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-1">{getLogIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium">
                      {log.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {log.user}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(log.timestamp?.toDate ? log.timestamp.toDate() : new Date(), language)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityLog
