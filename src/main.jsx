import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { NotificationProvider } from './contexts/NotificationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
)
