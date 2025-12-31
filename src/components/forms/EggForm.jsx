import { useState } from 'react'

function EggForm({ onSubmit, onClose }) {
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (quantity) {
      onSubmit(parseInt(quantity), note)
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2">عدد البيض</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="أدخل عدد البيض"
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
          placeholder="مثال: إنتاج يوم الأحد"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:from-amber-600 hover:to-orange-600 transition-all"
      >
        تسجيل البيض
      </button>
    </form>
  )
}

export default EggForm
