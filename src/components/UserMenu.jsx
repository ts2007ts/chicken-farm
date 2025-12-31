import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function UserMenu() {
  const [showMenu, setShowMenu] = useState(false)
  const { currentUser, userProfile, logout, isAdmin } = useAuth()

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
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-all"
      >
        <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
          {userProfile?.investorName ? userProfile.investorName.charAt(0) : '👤'}
        </div>
        <span className="hidden sm:inline text-sm">
          {userProfile?.investorName || currentUser?.email?.split('@')[0]}
        </span>
        {isAdmin() && (
          <span className="bg-amber-300 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
            مدير
          </span>
        )}
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl z-50 min-w-48 overflow-hidden" dir="rtl">
            <div className="p-4 border-b border-gray-100">
              <p className="font-bold text-gray-800">
                {userProfile?.investorName || 'مستخدم'}
              </p>
              <p className="text-sm text-gray-500">{currentUser?.email}</p>
              {isAdmin() && (
                <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                  صلاحيات المدير
                </span>
              )}
              {!isAdmin() && userProfile?.investorName && (
                <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  مستثمر
                </span>
              )}
            </div>
            
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>🚪</span>
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu
