import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ArchiveForm({ onSubmit, onClose }) {
  const { t } = useLanguage()
  const [cycleName, setCycleName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cycleName.trim()) return
    onSubmit(cycleName)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t?.eggs?.archives?.cycleName || 'Cycle Name'}</label>
        <input
          type="text"
          required
          value={cycleName}
          onChange={(e) => setCycleName(e.target.value)}
          placeholder="مثلاً: فوج شتاء 2026"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">{t?.common?.cancel || 'Cancel'}</button>
        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md">{t?.eggs?.archives?.archiveNow || 'Archive Now'}</button>
      </div>
    </form>
  )
}
