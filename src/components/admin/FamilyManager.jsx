import { useState, useEffect } from 'react'
import { subscribeToSettings, updateSetting, addLog, subscribeToInvestors } from '../../firebase/firestore'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { FAMILIES as DEFAULT_FAMILIES } from '../../constants'

function FamilyManager() {
  const { t, language } = useLanguage()
  const { userProfile } = useAuth()
  const [families, setFamilies] = useState([])
  const [investors, setInvestors] = useState([])
  const [newFamily, setNewFamily] = useState({ name: '', icon: '👨‍👩‍👧‍👦', memberCount: 1, investorIds: [] })
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState({ name: '', icon: '', memberCount: 1, investorIds: [] })
  const [eggPrice, setEggPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showInvestorSelector, setShowInvestorSelector] = useState(false)
  const [showEditInvestorSelector, setShowEditInvestorSelector] = useState(false)

  useEffect(() => {
    const unsubscribeSettings = subscribeToSettings((settings) => {
      if (settings.family_settings) {
        setFamilies(settings.family_settings.list || [])
        setEggPrice(settings.family_settings.eggPrice || 0)
      } else {
        setFamilies(DEFAULT_FAMILIES(t))
        setEggPrice(0)
      }
      setLoading(false)
    })

    const unsubscribeInvestors = subscribeToInvestors((investorsList) => {
      setInvestors(investorsList)
    })

    return () => {
      unsubscribeSettings()
      unsubscribeInvestors()
    }
  }, [t])

  const handleUpdateEggPrice = async (price) => {
    try {
      await updateSetting('family_settings', { 
        list: families,
        eggPrice: parseFloat(price) 
      })
      await addLog({
        type: 'update_egg_price',
        message: `Updated egg price to: ${price}`,
        user: userProfile?.email || 'Admin',
        details: { eggPrice: price }
      })
    } catch (error) {
      console.error("Error updating egg price:", error)
    }
  }

  const handleAddFamily = async (e) => {
    e.preventDefault()
    if (newFamily.investorIds.length === 0) return

    const selectedInvestors = investors.filter(inv => newFamily.investorIds.includes(String(inv.id)))
    const familyName = selectedInvestors.map(inv => inv.name).join(' و ')

    const id = `family_${Date.now()}`
    const updatedList = [...families, { 
      ...newFamily, 
      id, 
      name: familyName,
      memberCount: parseInt(newFamily.memberCount) 
    }]
    
    try {
      await updateSetting('family_settings', { list: updatedList, eggPrice })
      await addLog({
        type: 'add_family',
        message: `Added family: ${familyName} (${newFamily.memberCount} members)`,
        user: userProfile?.email || 'Admin',
        details: { ...newFamily, name: familyName }
      })
      setNewFamily({ name: '', icon: '👨‍👩‍👧‍👦', memberCount: 1, investorIds: [] })
      setShowInvestorSelector(false)
    } catch (error) {
      console.error("Error adding family:", error)
    }
  }

  const handleDeleteFamily = async (id) => {
    const family = families.find(f => f.id === id)
    const updatedList = families.filter(f => f.id !== id)
    
    try {
      await updateSetting('family_settings', { list: updatedList, eggPrice })
      await addLog({
        type: 'delete_family',
        message: `Deleted family: ${family?.name}`,
        user: userProfile?.email || 'Admin',
        details: { id }
      })
    } catch (error) {
      console.error("Error deleting family:", error)
    }
  }

  const handleStartEdit = (family) => {
    setEditingId(family.id)
    setEditValue({ 
      name: family.name, 
      icon: family.icon, 
      memberCount: family.memberCount || 1,
      investorIds: family.investorIds || (family.investorId ? [String(family.investorId)] : [])
    })
  }

  const handleUpdateFamily = async (id) => {
    const selectedInvestors = investors.filter(inv => editValue.investorIds.includes(String(inv.id)))
    const familyName = selectedInvestors.map(inv => inv.name).join(' و ')

    const updatedList = families.map(f => 
      f.id === id ? { 
        ...f, 
        name: familyName, 
        icon: editValue.icon, 
        memberCount: parseInt(editValue.memberCount),
        investorIds: editValue.investorIds
      } : f
    )
    
    try {
      await updateSetting('family_settings', { list: updatedList, eggPrice })
      await addLog({
        type: 'update_family',
        message: `Updated family: ${familyName}`,
        user: userProfile?.email || 'Admin',
        details: { id, ...editValue, name: familyName }
      })
      setEditingId(null)
      setShowEditInvestorSelector(false)
    } catch (error) {
      console.error("Error updating family:", error)
    }
  }

  const toggleInvestorSelection = (investorId, isEdit = false) => {
    const idStr = String(investorId)
    if (isEdit) {
      setEditValue(prev => {
        const isSelected = prev.investorIds.includes(idStr)
        if (!isSelected && prev.investorIds.length >= parseInt(prev.memberCount)) {
          return prev
        }
        return {
          ...prev,
          investorIds: isSelected
            ? prev.investorIds.filter(id => id !== idStr)
            : [...prev.investorIds, idStr]
        }
      })
    } else {
      setNewFamily(prev => {
        const isSelected = prev.investorIds.includes(idStr)
        if (!isSelected && prev.investorIds.length >= parseInt(prev.memberCount)) {
          return prev
        }
        return {
          ...prev,
          investorIds: isSelected
            ? prev.investorIds.filter(id => id !== idStr)
            : [...prev.investorIds, idStr]
        }
      })
    }
  }

  const getAvailableInvestors = (currentFamilyId = null) => {
    const assignedInvestorIds = families
      .filter(f => f.id !== currentFamilyId)
      .flatMap(f => (f.investorIds || []).map(id => String(id)))
    
    return investors.filter(inv => !assignedInvestorIds.includes(String(inv.id)))
  }

  if (loading) return <div className="p-4 text-center">{t.common.loading}</div>

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          👪 {language === 'ar' ? 'إدارة العائلات' : 'Family Management'}
        </h3>
      </div>
      <div className="p-4">
        {/* Egg Price Setting */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <label className="block text-sm font-bold text-amber-800 mb-2">
            💰 {t.eggs.eggPrice} ({t.common.currency})
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={eggPrice}
              onChange={(e) => setEggPrice(e.target.value)}
              className="flex-1 border rounded-lg p-2"
              placeholder="0"
            />
            <button 
              onClick={() => handleUpdateEggPrice(eggPrice)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-bold"
            >
              {t.common.update}
            </button>
          </div>
        </div>

        <form onSubmit={handleAddFamily} className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={newFamily.icon}
            onChange={(e) => setNewFamily({ ...newFamily, icon: e.target.value })}
            className="w-12 border rounded-lg p-2 text-center"
            placeholder="Icon"
          />
          <div className="flex-1 min-w-[200px] relative">
            <button
              type="button"
              onClick={() => setShowInvestorSelector(!showInvestorSelector)}
              className="w-full border rounded-lg p-2 bg-white text-right flex justify-between items-center"
            >
              <span className="truncate">
                {newFamily.investorIds.length > 0
                  ? investors
                      .filter(inv => newFamily.investorIds.includes(String(inv.id)))
                      .map(inv => inv.name)
                      .join(' و ')
                  : t.inventory.selectInvestorPlaceholder}
              </span>
              <span className="text-gray-400">▼</span>
            </button>
            
            {showInvestorSelector && (
              <div className="absolute bottom-full right-0 left-0 mb-1 bg-white border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                {getAvailableInvestors().map(inv => (
                  <label key={inv.id} className="flex items-center gap-2 p-2 hover:bg-amber-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFamily.investorIds.includes(String(inv.id))}
                      onChange={() => toggleInvestorSelection(inv.id)}
                      disabled={!newFamily.investorIds.includes(String(inv.id)) && newFamily.investorIds.length >= parseInt(newFamily.memberCount)}
                      className="w-4 h-4 accent-amber-600"
                    />
                    <span className="text-sm text-gray-700">{inv.name}</span>
                  </label>
                ))}
                {getAvailableInvestors().length === 0 && (
                  <p className="text-xs text-gray-500 p-2 text-center">No available investors</p>
                )}
              </div>
            )}
          </div>
          <input
            type="number"
            value={newFamily.memberCount}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value) || 1)
              setNewFamily({ ...newFamily, memberCount: val, investorIds: [] })
            }}
            className="w-20 border rounded-lg p-2"
            placeholder={t.eggs.memberCount}
            min="1"
          />
          <button 
            type="submit" 
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-bold disabled:opacity-50" 
            disabled={newFamily.investorIds.length !== parseInt(newFamily.memberCount)}
          >
            {t.common.save}
          </button>
        </form>

        <div className="space-y-2">
          {families.map((family) => (
            <div key={family.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg relative">
              {editingId === family.id ? (
                <div className="flex flex-wrap items-center gap-2 flex-1 mr-2">
                  <input
                    type="text"
                    value={editValue.icon}
                    onChange={(e) => setEditValue({ ...editValue, icon: e.target.value })}
                    className="w-10 border rounded p-1 text-center"
                  />
                  <div className="flex-1 min-w-[150px] relative">
                    <button
                      type="button"
                      onClick={() => setShowEditInvestorSelector(!showEditInvestorSelector)}
                      className="w-full border rounded p-1 bg-white text-right text-sm flex justify-between items-center"
                    >
                      <span className="truncate">
                        {editValue.investorIds.length > 0
                          ? investors
                              .filter(inv => editValue.investorIds.includes(String(inv.id)))
                              .map(inv => inv.name)
                              .join(' و ')
                          : t.inventory.selectInvestorPlaceholder}
                      </span>
                      <span className="text-gray-400 text-xs">▼</span>
                    </button>
                    
                    {showEditInvestorSelector && (
                      <div className="absolute bottom-full right-0 left-0 mb-1 bg-white border rounded shadow-xl z-50 max-h-40 overflow-y-auto p-1">
                        {getAvailableInvestors(family.id).map(inv => (
                          <label key={inv.id} className="flex items-center gap-2 p-1 hover:bg-amber-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editValue.investorIds.includes(String(inv.id))}
                              onChange={() => toggleInvestorSelection(inv.id, true)}
                              disabled={!editValue.investorIds.includes(String(inv.id)) && editValue.investorIds.length >= parseInt(editValue.memberCount)}
                              className="w-3 h-3 accent-amber-600"
                            />
                            <span className="text-xs text-gray-700">{inv.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="number"
                    value={editValue.memberCount}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1)
                      setEditValue({ ...editValue, memberCount: val, investorIds: [] })
                    }}
                    className="w-16 border rounded p-1"
                    min="1"
                  />
                  <button 
                    onClick={() => handleUpdateFamily(family.id)}
                    className="text-green-600 hover:text-green-700 font-bold p-1"
                    disabled={editValue.investorIds.length !== parseInt(editValue.memberCount)}
                  >
                    ✅
                  </button>
                  <button 
                    onClick={() => {
                      setEditingId(null)
                      setShowEditInvestorSelector(false)
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ❌
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xl">{family.icon}</span>
                  <div>
                    <span className="font-medium text-gray-700 block">{family.name}</span>
                    <span className="text-xs text-gray-400">{t.eggs.memberCount}: {family.memberCount || 1}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {editingId !== family.id && (
                  <button
                    onClick={() => handleStartEdit(family)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => handleDeleteFamily(family.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {families.length === 0 && (
            <p className="text-center text-gray-500 py-4 italic">
              {language === 'ar' ? 'لا توجد عائلات مضافة.' : 'No families added.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FamilyManager
