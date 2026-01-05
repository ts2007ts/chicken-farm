import { useState, useEffect } from 'react'
import { subscribeToSettings, updateSetting, addLog } from '../../firebase/firestore'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { EXPENSE_CATEGORIES as DEFAULT_CATEGORIES } from '../../constants'

const AVAILABLE_ICONS = ['🌾', '💊', '⚡', '💧', '👷', '🔧', '📦', '🐔', '🚜', '🏠', '🧹', '🚚', '🪵', '💰', '📉', '📈', '🎟️', '🍴', '🌡️', '💡']

function CategoryManager() {
  const { t, language } = useLanguage()
  const { userProfile } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📦' })
  const [editingId, setEditingId] = useState(null)
  const [showIconPicker, setShowIconPicker] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToSettings((settings) => {
      if (settings.expense_categories) {
        setCategories(settings.expense_categories.list || [])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleInitDefaults = async () => {
    const defaults = DEFAULT_CATEGORIES(t)
    try {
      await updateSetting('expense_categories', { list: defaults })
      await addLog({
        type: 'init_categories',
        message: `Initialized default expense categories`,
        user: userProfile?.investorName || 'Admin'
      })
    } catch (error) {
      console.error("Error initializing categories:", error)
    }
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name) return

    let updatedList
    if (editingId) {
      updatedList = categories.map(c => c.id === editingId ? { ...newCategory, id: editingId } : c)
      await addLog({
        type: 'edit_category',
        message: `Edited expense category: ${newCategory.name}`,
        user: userProfile?.investorName || 'Admin',
        details: newCategory
      })
    } else {
      const id = newCategory.name.toLowerCase().replace(/\s+/g, '_')
      updatedList = [...categories, { ...newCategory, id }]
      await addLog({
        type: 'add_category',
        message: `Added expense category: ${newCategory.name}`,
        user: userProfile?.investorName || 'Admin',
        details: newCategory
      })
    }
    
    try {
      await updateSetting('expense_categories', { list: updatedList })
      setNewCategory({ name: '', icon: '📦' })
      setEditingId(null)
      setShowIconPicker(false)
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleEditCategory = (category) => {
    setNewCategory({ name: category.name, icon: category.icon })
    setEditingId(category.id)
    setShowIconPicker(false)
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm(t.superAdmin.confirmDelete)) return
    const category = categories.find(c => c.id === id)
    const updatedList = categories.filter(c => c.id !== id)
    
    try {
      await updateSetting('expense_categories', { list: updatedList })
      await addLog({
        type: 'delete_category',
        message: `Deleted expense category: ${category?.name}`,
        user: userProfile?.investorName || 'Admin',
        details: { id }
      })
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  if (loading) return <div className="p-4 text-center">{t.common.loading}</div>

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          📁 {t.categories.title}
        </h3>
      </div>
      <div className="p-4">
        <form onSubmit={handleSaveCategory} className="space-y-4 mb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-12 h-10 border rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 transition-colors text-xl"
              title={t.categories.selectIcon}
            >
              {newCategory.icon}
            </button>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="flex-1 border rounded-lg p-2 outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={t.categories.placeholder}
            />
            <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-bold">
              {editingId ? t.common.update : t.common.save}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setNewCategory({ name: '', icon: '📦' }); setShowIconPicker(false); }}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-bold"
              >
                {t.common.cancel}
              </button>
            )}
          </div>

          {showIconPicker && (
            <div className="p-3 border rounded-lg bg-gray-50 grid grid-cols-5 sm:grid-cols-10 gap-2">
              {AVAILABLE_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => { setNewCategory({ ...newCategory, icon }); setShowIconPicker(false); }}
                  className={`text-2xl p-2 rounded-lg hover:bg-white transition-all ${newCategory.icon === icon ? 'bg-white ring-2 ring-amber-500' : ''}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className={`flex items-center justify-between p-3 rounded-lg group transition-colors ${editingId === category.id ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium text-gray-700">
                  {t.categories[category.id] || category.name}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  title={t.common.edit}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title={t.common.delete}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4 italic">
                {t.categories.noCustom}
              </p>
              <button
                onClick={handleInitDefaults}
                className="text-amber-600 font-bold hover:underline"
              >
                {t.categories.initDefaults}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryManager
