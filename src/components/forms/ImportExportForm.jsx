import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

function ImportExportForm({ onExport, onImport, onClose }) {
  const { t, language } = useLanguage()
  const [importText, setImportText] = useState('')

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onImport(event.target.result)
        onClose()
      }
      reader.readAsText(file)
    }
  }

  const handleTextImport = () => {
    if (importText.trim()) {
      onImport(importText)
      onClose()
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-bold text-green-800 mb-3">📤 {t.common.export}</h4>
        <p className="text-sm text-green-600 mb-3">{t.common.importExport?.export || 'Export Data'}</p>
        <button
          onClick={() => { onExport(); onClose(); }}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-all"
        >
          {t.common.export}
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-3">📥 {t.common.import}</h4>
        <p className="text-sm text-blue-600 mb-3">{t.common.importExport?.import || 'Import Data'}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-blue-700 mb-2">{language === 'ar' ? 'اختر ملف JSON:' : 'Select JSON File:'}</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full border border-blue-300 rounded-lg p-2 text-sm"
            />
          </div>

          <div className="text-center text-gray-400 text-sm">{language === 'ar' ? 'أو' : 'OR'}</div>

          <div>
            <label className="block text-sm text-blue-700 mb-2">{language === 'ar' ? 'الصق محتوى JSON:' : 'Paste JSON Content:'}</label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"investors": [...], "transactions": [...], "eggs": [...]}'
              className="w-full border border-blue-300 rounded-lg p-3 h-24 text-sm font-mono"
            />
            <button
              onClick={handleTextImport}
              disabled={!importText.trim()}
              className="w-full mt-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 rounded-lg font-bold transition-all"
            >
              {t.common.import}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          ⚠️ {t.common.importExport?.warning || (language === 'ar' ? 'تحذير: الاستيراد سيقوم بمسح البيانات الحالية' : 'Warning: Import will overwrite current data')}
        </p>
      </div>
    </div>
  )
}

export default ImportExportForm
