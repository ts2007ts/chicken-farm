import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ChickenForm({ onSubmit, onClose }) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    type: 'initial',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity)
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t?.eggs?.chicken?.type || 'Type'}</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="initial">{t?.eggs?.chicken?.initial || 'Initial'}</option>
          <option value="buy">{t?.eggs?.chicken?.buy || 'Buy'}</option>
          <option value="death">{t?.eggs?.chicken?.death || 'Death'}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t?.eggs?.chicken?.quantity || 'Quantity'}</label>
        <input
          type="number"
          required
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t.common.date}</label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t.common.notes}</label>
        <textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">{t.common.cancel}</button>
        <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-md">{t.common.save}</button>
      </div>
    </form>
  )
}
