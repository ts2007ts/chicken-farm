import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import Header from './components/Header'
import MainContent from './components/MainContent'

function App() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showImportExportModal, setShowImportExportModal] = useState(false)

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100" dir="rtl">
      <Header setShowImportExportModal={setShowImportExportModal} />

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'dashboard', name: 'لوحة التحكم', icon: '📊' },
              { id: 'investors', name: 'المستثمرين', icon: '👥' },
              { id: 'expenses', name: 'المصروفات', icon: '💰' },
              { id: 'eggs', name: 'البيض', icon: '🥚' },
              { id: 'inventory', name: 'الجرد', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-4 py-2 sm:py-3 font-medium transition-all whitespace-nowrap text-xs sm:text-base ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <span className="text-2xl sm:text-base sm:ml-2">{tab.icon}</span>
                <span className="text-sm sm:text-base">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <MainContent activeTab={activeTab} />
      </main>
    </div>
  )
}

export default App
