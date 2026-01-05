import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

function LoginPage() {
  const { t, language } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [loginMethod, setLoginMethod] = useState('password') // 'password' or 'link'

  const { login, sendLoginLink } = useAuth()

  async function handlePasswordLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/user-not-found') {
        setError(t.login.errorUserNotFound)
      } else if (err.code === 'auth/wrong-password') {
        setError(t.login.errorWrongPassword)
      } else if (err.code === 'auth/invalid-email') {
        setError(t.login.errorInvalidEmail)
      } else if (err.code === 'auth/invalid-credential') {
        setError(t.login.errorInvalidCredential)
      } else {
        setError(t.login.errorGeneral)
      }
    }

    setLoading(false)
  }

  async function handleEmailLinkLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await sendLoginLink(email)
      setEmailSent(true)
    } catch (err) {
      console.error(err)
      setError(t.login.errorLinkSend)
    }

    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.login.linkSentTitle}</h2>
          <p className="text-gray-600 mb-6">
            {t.login.linkSentBody}
            <br />
            <span className="font-bold text-amber-600">{email}</span>
          </p>
          <p className="text-sm text-gray-500">
            {t.login.linkSentInstruction}
          </p>
          <button
            onClick={() => setEmailSent(false)}
            className="mt-6 text-amber-600 hover:text-amber-700 font-medium"
          >
            {language === 'ar' ? '← ' : '→ '}{t.common.return}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐔</div>
          <h1 className="text-2xl font-bold text-gray-800">{t.login.title}</h1>
          <p className="text-gray-500 mt-2">{t.login.subtitle}</p>
        </div>

        {/* Login Method Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLoginMethod('password')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              loginMethod === 'password'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.login.methodPassword}
          </button>
          <button
            onClick={() => setLoginMethod('link')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              loginMethod === 'link'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.login.methodLink}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleEmailLinkLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t.common.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={t.login.emailPlaceholder}
                required
              />
            </div>

            {loginMethod === 'password' && (
              <div>
                <label className="block text-gray-700 mb-2 font-medium">{t.common.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t.login.passwordPlaceholder}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t.common.loading}
                </span>
              ) : loginMethod === 'password' ? (
                t.login.submitPassword
              ) : (
                t.login.submitLink
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {loginMethod === 'link' ? (
            <p>{t.login.infoLink}</p>
          ) : (
            <p>{t.login.infoPassword}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
