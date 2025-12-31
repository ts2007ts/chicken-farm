import { useState } from 'react'

function EditTransactionForm({ transaction, categories, investors, onSubmit, onClose }) {
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [note, setNote] = useState(transaction.note || '')
  const [date, setDate] = useState(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState(transaction.category || categories[0]?.id)
  const [selectedInvestor, setSelectedInvestor] = useState(transaction.investorId || investors[0]?.id)

  const handleSubmit = (e) => {
    e.preventDefault()
    const updates = {
      amount: parseFloat(amount),
      note,
      date: new Date(date).toISOString(),
    }
    if (transaction.type === 'expense') {
      updates.category = category
    } else {
      updates.investorId = selectedInvestor
      updates.investorName = investors.find(inv => inv.id === selectedInvestor)?.name
    }
    onSubmit(updates)
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
      {transaction.type === 'expense' ? (
        <div>
          <label className="block text-gray-700 mb-2">الفئة</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
      ) : (
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
      )}
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
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all"
      >
        حفظ التعديلات
      </button>
    </form>
  )
}

export default EditTransactionForm
