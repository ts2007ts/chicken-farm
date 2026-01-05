import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

function UserMenu() {
  const { currentUser, logout, userProfile } = useAuth()
  const { t, language, toggleLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-lg transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white shadow-inner">
          {userProfile?.investorName?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase()}
        </div>
        <div className={`hidden sm:block text-${language === 'ar' ? 'right' : 'left'}`}>
          <p className="text-sm font-bold leading-tight">{userProfile?.investorName || t.common.login}</p>
          <p className="text-[10px] text-amber-100 opacity-80">{userProfile?.role === 'super_admin' ? t.common.superAdmin : userProfile?.role === 'admin' ? t.superAdmin.admin : t.superAdmin.investor}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden`}>
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-bold text-gray-800">{userProfile?.investorName}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
            </div>
            
            <button
              onClick={() => {
                toggleLanguage()
                setIsOpen(false)
              }}
              className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors flex items-center justify-between`}
            >
              <span>{language === 'ar' ? 'English (EN)' : 'Arabic (عربي)'}</span>
              <span>🌐</span>
            </button>

            <button
              onClick={handleLogout}
              className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center justify-between`}
            >
              <span>{t.common.logout}</span>
              <span>🚪</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu
