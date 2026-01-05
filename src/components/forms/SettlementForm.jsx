import { useState } from 'react'
import { formatNumber } from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

function SettlementForm({ investor, balance, onSubmit, onClose }) {
  const { isAdmin } = useAuth()
  const { t } = useLanguage()
  
  // Only admin can settle
  if (!isAdmin()) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t.common.error}: Only admin can perform settlement.</p>
      </div>
    )
  }
  const isFemale = investor?.gender === 'female'
  const balanceNum = parseFloat(balance)
  const isPositive = balanceNum > 0
  const absBalance = Math.abs(balanceNum)
  const roundedBalance = Math.round(absBalance / 1000) * 1000
  
  const [amount, setAmount] = useState(roundedBalance.toString())
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (amount) {
      const type = isPositive ? 'receive' : 'pay'
      onSubmit(parseFloat(amount), type, note, new Date(date).toISOString())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`p-4 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
        <p className="text-sm text-gray-600 mb-1">{t.investors.expectedBalance}:</p>
        <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '' : '-'}{Math.round(absBalance / 1000) * 1000} {t.common.currency}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {isPositive 
            ? `💰 ${investor.name} ${isFemale ? 'تستحق' : 'يستحق'} استلام رصيد` 
            : `💳 ${investor.name} ${isFemale ? 'يجب عليها' : 'يجب عليه'} دفع مبلغ للصندوق`}
        </p>
      </div>

      <div>
        <label className="block text-gray-700 mb-2">{t.common.date}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">{t.common.amount} ({t.common.currency})</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t.common.amount}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">{t.common.notes}</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.common.notes}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          isPositive 
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
        } text-white`}
      >
        {isPositive ? t.investors.settleReceive : t.investors.settlePay}
      </button>
    </form>
  )
}

export default SettlementForm
