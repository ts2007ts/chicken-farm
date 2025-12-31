import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function ContributionForm({ investors, onSubmit, onClose }) {
  const { isAdmin } = useAuth()
  
  const [selectedInvestor, setSelectedInvestor] = useState(investors[0]?.id)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (amount && selectedInvestor) {
      onSubmit(selectedInvestor, parseFloat(amount), note, new Date(date).toISOString())
      onClose()
    }
  }

  // Only admin can add contributions
  if (!isAdmin()) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">فقط المدير يمكنه الإضافة للرأسمال.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2">التاريخ</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-2">المستثمر</label>
        <select
          value={selectedInvestor}
          onChange={(e) => setSelectedInvestor(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          {investors.map(inv => (
            <option key={inv.id} value={inv.id}>{inv.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 mb-2">المبلغ (ل.س)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="أدخل المبلغ"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-2">ملاحظة</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظة اختيارية"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all"
      >
        إضافة للرأسمال
      </button>
    </form>
  )
}

export default ContributionForm
