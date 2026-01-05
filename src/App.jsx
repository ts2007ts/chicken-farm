import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useLanguage } from './contexts/LanguageContext'
import LoginPage from './components/LoginPage'
import Header from './components/Header'
import MainContent from './components/MainContent'

function App() {
  const { currentUser, isSuperAdmin } = useAuth()
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showImportExportModal, setShowImportExportModal] = useState(false)

  // Update active tab if super admin
  useEffect(() => {
    if (isSuperAdmin()) {
      setActiveTab('super_admin')
    }
  }, [isSuperAdmin])

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage />
  }

  const tabs = [
    { id: 'dashboard', name: t.common.dashboard, icon: '📊' },
    { id: 'investors', name: t.common.investors, icon: '👥' },
    { id: 'expenses', name: t.common.expenses, icon: '💰' },
    { id: 'eggs', name: t.common.eggs, icon: '🥚' },
    { id: 'inventory', name: t.common.inventory, icon: '📋' },
  ]

  if (isSuperAdmin()) {
    tabs.unshift({ id: 'super_admin', name: t.common.superAdmin, icon: '🔑' })
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header setShowImportExportModal={setShowImportExportModal} />

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-4 py-2 sm:py-3 font-medium transition-all whitespace-nowrap text-xs sm:text-base ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <span className={`text-2xl sm:text-base ${language === 'ar' ? 'sm:ml-2' : 'sm:mr-2'}`}>{tab.icon}</span>
                <span className="text-sm sm:text-base">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <MainContent 
          activeTab={activeTab} 
          showImportExportModal={showImportExportModal}
          setShowImportExportModal={setShowImportExportModal}
        />
      </main>
    </div>
  )
}

export default App
