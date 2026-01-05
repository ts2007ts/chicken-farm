import {
  updateInvestor,
  addTransaction,
  updateTransaction as updateTransactionFirestore,
  deleteTransaction as deleteTransactionFirestore,
  addEgg,
  updateEgg as updateEggFirestore,
  deleteEgg as deleteEggFirestore,
  exportAllData,
  importAllData,
  addLog
} from '../firebase/firestore'

export function useActions(investors, userProfile) {
  const handleSetCapital = async (investorId, amount) => {
    try {
      await updateInvestor(investorId, { initialCapital: amount, currentCapital: amount })
      const investor = investors.find(inv => inv.id === investorId)
      await addLog({
        type: 'set_capital',
        message: `Set capital for ${investor?.name} to ${amount}`,
        user: userProfile?.investorName || 'Admin',
        details: { investorId, amount }
      })
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
      await addLog({
        type: 'add_expense',
        message: `Added expense: ${expense.amount} - ${expense.note || ''}`,
        user: userProfile?.investorName || 'Admin',
        details: expense
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
      await addLog({
        type: 'add_contribution',
        message: `Added contribution for ${investor?.name}: ${amount}`,
        user: userProfile?.investorName || 'Admin',
        details: { investorId, amount, note }
      })
    } catch (error) {
      console.error("Error adding contribution:", error)
      alert("خطأ في حفظ الإضافة")
    }
  }

  const handleAddEggs = async (quantity, note, families) => {
    try {
      // Calculate initial delivery amounts for each current family
      const familyCount = families?.length || 1;
      const sharePerFamily = Math.floor(quantity / familyCount);
      
      const deliveries = {};
      if (families && families.length > 0) {
        families.forEach(family => {
          deliveries[family.id] = {
            delivered: false,
            amount: sharePerFamily,
            familyId: family.id,
            familyName: family.name
          };
        });
      }

      await addEgg({
        quantity,
        note,
        date: new Date().toISOString(),
        recordedBy: userProfile.investorName,
        recordedById: userProfile.investorId,
        deliveries,
        familyCountAtProduction: familyCount
      })
      await addLog({
        type: 'add_eggs',
        message: `Recorded ${quantity} eggs`,
        user: userProfile?.investorName || 'Admin',
        details: { quantity, note }
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
            status: 'delivered',
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

  const handleRejectEggDelivery = async (eggId, familyId, eggs, families, settings) => {
    try {
      const egg = eggs.find(e => e.id === eggId)
      const family = families.find(f => f.id === familyId)
      const deliveries = egg.deliveries || {}
      
      // Calculate share per family member
      const eggPrice = settings?.family_settings?.eggPrice || 0
      const totalEggShare = Math.floor(egg.quantity / Math.max(1, egg.familyCountAtProduction || families.length))
      const cashValue = totalEggShare * eggPrice

      // 1. Update egg record status
      await updateEggFirestore(eggId, {
        deliveries: {
          ...deliveries,
          [familyId]: {
            delivered: false,
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectedBy: userProfile.investorName,
            cashValue,
            eggPrice
          }
        }
      })

      // 2. Create automated contribution transactions for each family member
      const familyMemberIds = family.investorIds || []
      if (familyMemberIds.length > 0) {
        const sharePerMember = cashValue / familyMemberIds.length
        
        for (const investorId of familyMemberIds) {
          const investor = investors.find(inv => String(inv.id) === String(investorId))
          if (investor) {
            await addTransaction({
              type: 'contribution',
              investorId: investor.id,
              investorName: investor.name,
              amount: sharePerMember,
              note: `قيمة بيض مرفوض (${totalEggShare} بيضة) - عائلة ${family.name}`,
              date: new Date().toISOString(),
              automated: true,
              relatedEggId: eggId,
              relatedFamilyId: familyId
            })
          }
        }
      }
      
      await addLog({
        type: 'reject_egg_delivery',
        message: `Rejected ${totalEggShare} eggs for ${family.name}. Converted to ${cashValue} SYP and split among members.`,
        user: userProfile?.investorName || 'Admin',
        details: { eggId, familyId, cashValue, eggPrice, totalEggShare, memberCount: familyMemberIds.length }
      })

      alert(`تم رفض الاستلام وتحويل ${totalEggShare} بيضة إلى مبلغ ${cashValue} وتوزيعها على أفراد العائلة`)
    } catch (error) {
      console.error("Error rejecting egg delivery:", error)
      alert("خطأ في رفض الاستلام")
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
    handleRejectEggDelivery,
    handleExportData,
    handleImportData
  }
}
