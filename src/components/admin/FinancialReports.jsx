import { useState, useMemo } from 'react'
import { formatNumber, formatDate } from '../../utils/helpers'
import { useLanguage } from '../../contexts/LanguageContext'

function FinancialReports({ transactions, investors, totalExpenses, totalContributions, totalEggs, chickenInventory, feedInventory, archives }) {
  const { t, language } = useLanguage()
  const [timeframe, setTimeframe] = useState('all') // all, month, year

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    return transactions.filter(t => {
      const date = new Date(t.date)
      if (timeframe === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }
      if (timeframe === 'year') {
        return date.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [transactions, timeframe])

  const stats = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const contributions = filteredTransactions.filter(t => t.type === 'contribution').reduce((sum, t) => sum + t.amount, 0)
    const net = contributions - expenses
    
    const totalChickens = chickenInventory?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0
    const totalFeed = feedInventory?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0
    const totalArchives = archives?.length || 0

    return { expenses, contributions, net, totalChickens, totalFeed, totalArchives }
  }, [filteredTransactions, chickenInventory, feedInventory, archives])

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden col-span-full">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          📊 {language === 'ar' ? 'التقارير المالية والتحليلات' : 'Financial Reports & Analytics'}
        </h3>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="border rounded-lg p-1 text-sm outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">{language === 'ar' ? 'الكل' : 'All Time'}</option>
          <option value="month">{language === 'ar' ? 'هذا الشهر' : 'This Month'}</option>
          <option value="year">{language === 'ar' ? 'هذه السنة' : 'This Year'}</option>
        </select>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
          <p className="text-sm text-red-600 font-medium mb-1">{language === 'ar' ? 'إجمالي المصاريف' : 'Total Expenses'}</p>
          <p className="text-2xl font-bold text-red-700">{formatNumber(stats.expenses)} {t.common.currency}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
          <p className="text-sm text-blue-600 font-medium mb-1">{language === 'ar' ? 'إجمالي الإضافات' : 'Total Contributions'}</p>
          <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.contributions)} {t.common.currency}</p>
        </div>
        <div className={`p-4 rounded-xl border text-center ${stats.net >= 0 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
          <p className={`text-sm font-medium mb-1 ${stats.net >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {language === 'ar' ? 'صافي التدفق' : 'Net Cash Flow'}
          </p>
          <p className={`text-2xl font-bold ${stats.net >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
            {formatNumber(stats.net)} {t.common.currency}
          </p>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-medium">{language === 'ar' ? 'إجمالي الدجاج' : 'Total Chickens'}</p>
            <p className="text-xl font-bold text-amber-700">{formatNumber(stats.totalChickens)}</p>
          </div>
          <span className="text-2xl">🐔</span>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium">{language === 'ar' ? 'إجمالي العلف' : 'Total Feed'}</p>
            <p className="text-xl font-bold text-emerald-700">{formatNumber(stats.totalFeed)} <span className="text-sm">كجم</span></p>
          </div>
          <span className="text-2xl">🌾</span>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-600 font-medium">{language === 'ar' ? 'الدورات المؤرشفة' : 'Archived Cycles'}</p>
            <p className="text-xl font-bold text-indigo-700">{stats.totalArchives}</p>
          </div>
          <span className="text-2xl">📁</span>
        </div>
      </div>
      
      {/* Category distribution chart placeholder / simple list */}
      <div className="px-6 pb-6">
        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
          {language === 'ar' ? 'توزيع المصاريف حسب الفئة' : 'Expense Distribution by Category'}
        </h4>
        <div className="space-y-3">
          {/* Simple distribution bars */}
          {/* This would be more advanced with a real chart library, but we can do simple CSS bars */}
          {/* We'll implement this later if needed */}
          <p className="text-xs text-gray-400 italic">
            {language === 'ar' ? 'يتم تحديث البيانات تلقائياً بناءً على الفترة المختارة' : 'Data updates automatically based on selected timeframe'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FinancialReports
