import { useState } from 'react'
import { formatNumber } from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

function CapitalForm({ investors, onSubmit, onClose }) {
  const { isAdmin } = useAuth()
  const { t } = useLanguage()
  
  const [capitals, setCapitals] = useState(
    investors.reduce((acc, inv) => ({ ...acc, [inv.id]: inv.initialCapital }), {})
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    Object.entries(capitals).forEach(([id, amount]) => {
      onSubmit(id, parseFloat(amount) || 0)
    })
    onClose()
  }

  // Only admin can set capital
  if (!isAdmin()) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t.investors.setCapital}: Only admin can perform this action.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {investors.map(investor => (
        <div key={investor.id}>
          <label className="block text-gray-700 mb-2">{investor.name}</label>
          <input
            type="number"
            value={capitals[investor.id]}
            onChange={(e) => setCapitals(prev => ({ ...prev, [investor.id]: e.target.value }))}
            placeholder={t.investors.initialCapital}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:from-amber-600 hover:to-orange-600 transition-all"
      >
        {t.common.save} {t.dashboard.capital}
      </button>
    </form>
  )
}

export default CapitalForm
