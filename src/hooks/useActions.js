import {
  updateInvestor,
  addTransaction,
  updateTransaction as updateTransactionFirestore,
  deleteTransaction as deleteTransactionFirestore,
  addEgg,
  updateEgg as updateEggFirestore,
  deleteEgg as deleteEggFirestore,
  exportAllData,
  importAllData
} from '../firebase/firestore'

export function useActions(investors, userProfile) {
  const handleSetCapital = async (investorId, amount) => {
    try {
      await updateInvestor(investorId, { initialCapital: amount, currentCapital: amount })
    } catch (error) {
      console.error("Error setting capital:", error)
      alert("خطأ في حفظ رأس المال")
    }
  }

  const handleAddExpense = async (expense) => {
    try {
      await addTransaction({
        type: 'expense',
        ...expense,
      })
    } catch (error) {
      console.error("Error adding expense:", error)
      alert("خطأ في حفظ المصروف")
    }
  }

  const handleEditTransaction = async (id, updates) => {
    if (!id) {
      console.error("Transaction ID is missing")
      alert("خطأ: معرف المعاملة مفقود")
      return
    }
    try {
      await updateTransactionFirestore(id, updates)
    } catch (error) {
      console.error("Error editing transaction:", error)
      alert("خطأ في تعديل المعاملة")
    }
  }

  const handleAddContribution = async (investorId, amount, note, date) => {
    try {
      const investor = investors.find(inv => inv.id === investorId)
      await addTransaction({
        type: 'contribution',
        investorId,
        investorName: investor.name,
        amount,
        note,
        date: date || new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error adding contribution:", error)
      alert("خطأ في حفظ الإضافة")
    }
  }

  const handleAddEggs = async (quantity, note) => {
    try {
      await addEgg({
        quantity,
        note,
        date: new Date().toISOString(),
        recordedBy: userProfile.investorName,
        recordedById: userProfile.investorId
      })
    } catch (error) {
      console.error("Error adding eggs:", error)
      alert("خطأ في حفظ سجل البيض")
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransactionFirestore(id)
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("خطأ في حذف المعاملة")
    }
  }

  const handleSettlement = async (investorId, amount, type, note, date) => {
    try {
      const investor = investors.find(inv => inv.id === investorId)
      await addTransaction({
        type: 'settlement',
        settlementType: type,
        investorId,
        investorName: investor.name,
        amount: parseFloat(amount),
        note,
        date: date || new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error adding settlement:", error)
      alert("خطأ في حفظ التصفية")
    }
  }

  const handleDeleteEgg = async (id) => {
    try {
      await deleteEggFirestore(id)
    } catch (error) {
      console.error("Error deleting egg record:", error)
      alert("خطأ في حذف سجل البيض")
    }
  }

  const handleConfirmEggDelivery = async (eggId, familyId, eggs) => {
    try {
      const egg = eggs.find(e => e.id === eggId)
      const deliveries = egg.deliveries || {}
      
      await updateEggFirestore(eggId, { 
        deliveries: {
          ...deliveries,
          [familyId]: {
            delivered: true,
            deliveredAt: new Date().toISOString(),
            confirmedBy: userProfile.investorName
          }
        }
      })
    } catch (error) {
      console.error("Error confirming egg delivery:", error)
      alert("خطأ في تأكيد الاستلام")
    }
  }

  const handleExportData = async () => {
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chicken-farm-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('حدث خطأ أثناء تصدير البيانات')
    }
  }

  const handleImportData = async (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      const results = await importAllData(data)
      alert(`تم استيراد البيانات بنجاح!\n\n✅ ${results.investors} مستثمر\n✅ ${results.users} مستخدم\n✅ ${results.transactions} معاملة\n✅ ${results.eggs} سجل بيض`)
    } catch (error) {
      console.error('Import error:', error)
      alert('خطأ في قراءة الملف. تأكد من صحة الملف.')
    }
  }

  return {
    handleSetCapital,
    handleAddExpense,
    handleEditTransaction,
    handleAddContribution,
    handleAddEggs,
    handleDeleteTransaction,
    handleSettlement,
    handleDeleteEgg,
    handleConfirmEggDelivery,
    handleExportData,
    handleImportData
  }
}
