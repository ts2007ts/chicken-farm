import { formatNumber } from '../utils/helpers'
import UserMenu from './UserMenu'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { useCalculations } from '../hooks/useCalculations'

function Header({ setShowImportExportModal }) {
  const { currentUser, isAdmin } = useAuth()
  const { investors, transactions, eggs } = useAppData(currentUser)
  const { balance } = useCalculations(investors, transactions, eggs)

  return (
    <header className="bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl">🐔</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">مزرعة الدجاج</h1>
              <p className="text-amber-100 text-xs sm:text-sm hidden sm:block">نظام إدارة المزرعة والمستثمرين</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {isAdmin() && (
              <button
                onClick={() => setShowImportExportModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">📁 استيراد/تصدير</span>
                <span className="sm:hidden">📁</span>
              </button>
            )}
            <div className="text-left">
              <p className="text-amber-100 text-xs sm:text-sm">الرصيد الحالي</p>
              <p className={`text-lg sm:text-2xl font-bold ${balance < 0 ? 'text-red-200' : ''}`}>
                {balance < 0 ? `(${formatNumber(Math.abs(balance))})` : formatNumber(balance)} ل.س
              </p>
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
