import {
  addLog,
  updateInvestor,
  addTransaction,
  updateTransaction as updateTransactionFirestore,
  deleteTransaction as deleteTransactionFirestore,
  addEgg,
  updateEgg as updateEggFirestore,
  deleteEgg as deleteEggFirestore,
  exportAllData,
  importAllData,
  addChickenRecord,
  deleteChickenRecord,
  addFeedRecord,
  deleteFeedRecord,
  archiveCycle,
  addDebt,
  updateDebt,
  deleteDebt,
  getDebt
} from '../firebase/firestore'
import { useNotifications } from '../contexts/NotificationContext'

export function useActions(investors, userProfile) {
  const { notifyAllInvestors, sendNotification, deleteNotificationsByRelatedId } = useNotifications()

  const handleSetCapital = async (investorId, amount) => {
    try {
      await updateInvestor(investorId, { initialCapital: amount, currentCapital: amount })
      
      const investor = (investors || []).find(inv => {
        const invId = String(inv.id || '');
        const invUid = String(inv.uid || '');
        const targetId = String(investorId || '');
        return (invId === targetId || invUid === targetId) && targetId !== '';
      });
      
      if (investor) {
        await addLog({
          type: 'set_capital',
          message: `Set capital for ${investor.name} to ${amount.toLocaleString()}`,
          user: userProfile?.investorName || 'Admin',
          details: { investorId: investor.id || investor.uid, amount }
        })

        // Notify all investors about capital change
        await notifyAllInvestors(
          'notifications.types.capital',
          'notifications.messages.capital',
          'capital',
          investor.id || investor.uid,
          { name: investor.name, amount: amount.toLocaleString(), currency: 'ل.س' }
        )
      }
    } catch (error) {
      console.error("Error setting capital:", error)
      alert("خطأ في حفظ رأس المال")
    }
  }

  const handleAddExpense = async (expense) => {
    try {
      const transactionId = await addTransaction({
        type: 'expense',
        ...expense,
      }, userProfile?.email)
      await addLog({
        type: 'add_expense',
        message: `Added expense: ${expense.amount} - ${expense.note || ''}`,
        user: userProfile?.investorName || 'Admin',
        details: expense
      })

      // Notify all investors about new expense
      await notifyAllInvestors(
        'notifications.types.expense',
        'notifications.messages.expense',
        'expense',
        transactionId,
        { amount: expense.amount.toLocaleString(), currency: 'ل.س', note: expense.note || '' }
      )
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
      await updateTransactionFirestore(id, updates, userProfile?.email)
    } catch (error) {
      console.error("Error editing transaction:", error)
      alert("خطأ في تعديل المعاملة")
    }
  }

  const handleUpdateSetting = async (id, data) => {
    try {
      const oldSettings = await getSettings();
      const oldValue = id === 'family_settings' ? oldSettings.family_settings?.eggPrice : null;
      
      await updateSetting(id, data);
      
      if (id === 'family_settings' && data.eggPrice !== oldValue) {
        await addLog({
          type: 'update_setting',
          message: `Changed egg price from ${oldValue} to ${data.eggPrice}`,
          user: userProfile?.investorName || 'Admin',
          details: { setting: id, oldValue, newValue: data.eggPrice }
        })
      }
    } catch (error) {
      console.error("Error updating setting:", error);
    }
  }

  const handleAddContribution = async (investorId, amount, note, date) => {
    try {
      // Find the investor using robust comparison that covers all possible ID fields
      const investor = (investors || []).find(inv => {
        const invId = String(inv.id || '');
        const invUid = String(inv.uid || '');
        const targetId = String(investorId || '');
        return (invId === targetId || invUid === targetId) && targetId !== '';
      });
      
      if (!investor) {
        alert(`خطأ: لم يتم العثور على المستثمر (ID: ${investorId}) في القائمة الحالية. يرجى تحديث الصفحة.`);
        return;
      }

      const transactionId = await addTransaction({
        type: 'contribution',
        investorId: investor.id || investor.uid,
        investorName: investor.name,
        amount,
        note,
        date: date || new Date().toISOString(),
      }, userProfile?.email)
      
      await addLog({
        type: 'add_contribution',
        message: `Added contribution for ${investor.name}: ${amount}`,
        user: userProfile?.investorName || 'Admin',
        details: { investorId: investor.id || investor.uid, amount, note }
      })

      // Notify all investors about new contribution
      await notifyAllInvestors(
        'notifications.types.contribution',
        'notifications.messages.contribution',
        'contribution',
        transactionId,
        { name: investor.name, amount: amount.toLocaleString(), currency: 'ل.س' }
      )
    } catch (error) {
      console.error("Error adding contribution:", error);
      alert("خطأ في حفظ الإضافة");
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

      const eggId = await addEgg({
        quantity,
        note,
        date: new Date().toISOString(),
        recordedBy: userProfile.investorName,
        recordedById: userProfile.investorId,
        deliveries,
        familyCountAtProduction: familyCount
      }, userProfile?.email)
      await addLog({
        type: 'add_eggs',
        message: `Recorded ${quantity} eggs`,
        user: userProfile?.investorName || 'Admin',
        details: { quantity, note }
      })

      // Send notifications
      await notifyAllInvestors(
        'notifications.types.egg',
        'notifications.messages.egg',
        'egg',
        eggId,
        { quantity: quantity.toLocaleString() }
      )
    } catch (error) {
      console.error("Error adding eggs:", error)
      alert("خطأ في حفظ سجل البيض")
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransactionFirestore(id, userProfile?.email)
      // Delete associated notifications
      await deleteNotificationsByRelatedId(id)
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("خطأ في حذف المعاملة")
    }
  }

  const handleSettlement = async (investorId, amount, type, note, date) => {
    try {
      const investor = (investors || []).find(inv => {
        const invId = String(inv.id || '');
        const invUid = String(inv.uid || '');
        const targetId = String(investorId || '');
        return (invId === targetId || invUid === targetId) && targetId !== '';
      });
      
      if (!investor) {
        console.error("Investor not found for settlement:", investorId)
        alert(`خطأ: لم يتم العثور على المستثمر (ID: ${investorId})`)
        return
      }

      await addTransaction({
        type: 'settlement',
        settlementType: type,
        investorId: investor.id || investor.uid,
        investorName: investor.name,
        amount: parseFloat(amount),
        note,
        date: date || new Date().toISOString(),
      }, userProfile?.email)
    } catch (error) {
      console.error("Error adding settlement:", error)
      alert("خطأ في حفظ التصفية")
    }
  }

  const handleDeleteEgg = async (id) => {
    try {
      await deleteEggFirestore(id, userProfile?.email)
      // Delete associated notifications
      await deleteNotificationsByRelatedId(id)
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
      }, userProfile?.email)
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
      }, userProfile?.email)

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
            }, userProfile?.email)
          }
        }
      }
      
      await addLog({
        type: 'reject_egg_delivery',
        message: `Rejected ${totalEggShare} eggs for ${family.name}. Converted to ${cashValue} SYP and split among members.`,
        user: userProfile?.investorName || 'Admin',
        details: { eggId, familyId, cashValue, eggPrice, totalEggShare, memberCount: familyMemberIds.length }
      })

      // Notify family members
      for (const investorId of familyMemberIds) {
        const investor = investors.find(inv => String(inv.id) === String(investorId))
        if (investor && investor.uid) {
          await sendNotification(
            investor.uid,
            '⚠️ رفض استلام بيض',
            `تم رفض استلام حصة العائلة من البيض وتحويلها لمبلغ مالي (${cashValue / familyMemberIds.length} ل.س)`,
            'reject'
          )
        }
      }

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

  const handleAddChickenRecord = async (record) => {
    try {
      await addChickenRecord({
        ...record,
        recordedBy: userProfile.investorName,
        recordedById: userProfile.investorId,
      })
      await addLog({
        type: 'add_chicken_record',
        message: `Added chicken record: ${record.type} - ${record.quantity}`,
        user: userProfile?.investorName || 'Admin',
        details: record
      })
    } catch (error) {
      console.error("Error adding chicken record:", error)
      alert("خطأ في حفظ سجل الدجاج")
    }
  }

  const handleDeleteChickenRecord = async (id) => {
    try {
      await deleteChickenRecord(id)
    } catch (error) {
      console.error("Error deleting chicken record:", error)
      alert("خطأ في حذف سجل الدجاج")
    }
  }

  const handleAddFeedRecord = async (record) => {
    try {
      await addFeedRecord({
        ...record,
        recordedBy: userProfile.investorName,
        recordedById: userProfile.investorId,
      })
      await addLog({
        type: 'add_feed_record',
        message: `Added feed record: ${record.type} - ${record.quantity}kg`,
        user: userProfile?.investorName || 'Admin',
        details: record
      })
    } catch (error) {
      console.error("Error adding feed record:", error)
      alert("خطأ في حفظ سجل الأعلاف")
    }
  }

  const handleDeleteFeedRecord = async (id) => {
    try {
      await deleteFeedRecord(id)
    } catch (error) {
      console.error("Error deleting feed record:", error)
      alert("خطأ في حذف سجل الأعلاف")
    }
  }

  const handleArchiveCycle = async (cycleName) => {
    if (!window.confirm('هل أنت متأكد من أرشفة هذه الدورة؟ سيتم مسح جميع البيانات الحالية والبدء بدورة جديدة.')) return
    
    try {
      const currentData = await exportAllData()
      await archiveCycle({
        name: cycleName,
        data: currentData,
        investorCount: investors.length,
        totalInitialCapital: investors.reduce((sum, inv) => sum + inv.initialCapital, 0)
      })
      await addLog({
        type: 'archive_cycle',
        message: `Archived cycle: ${cycleName}`,
        user: userProfile?.investorName || 'Admin'
      })
      alert('تم أرشفة الدورة بنجاح والبدء بدورة جديدة')
    } catch (error) {
      console.error("Error archiving cycle:", error)
      alert("خطأ في أرشفة الدورة")
    }
  }

  const handleAddDebt = async (debtData) => {
    try {
      // For initial debt creation, we don't automatically create transactions
      // Payments will be handled via a separate confirmation process
      const initialPaid = debtData.paidAmount || 0;
      const debtToCreate = {
        ...debtData,
        payments: [] // Track individual payment records
      };

      const debtId = await addDebt(debtToCreate, userProfile?.email);
      
      await addLog({
        type: 'add_debt',
        message: `Added debt for: ${debtData.creditorName} - Total: ${debtData.totalAmount}`,
        user: userProfile?.investorName || 'Admin',
        details: debtData
      });

      return debtId;
    } catch (error) {
      console.error("Error adding debt:", error);
      alert("خطأ في إضافة الدين");
    }
  };

  const handleAddDebtPayment = async (debtId, paymentData) => {
    try {
      const debt = await getDebt(debtId);
      if (!debt) throw new Error("Debt not found");

      const { amount, source, date, investorPayments } = paymentData;
      
      // 1. Create Transactions based on source
      
      // ALWAYS create an expense for the total amount paid, 
      // regardless of source, so it's shared among all investors.
      const expenseId = await addTransaction({
        type: 'expense',
        category: 'maintenance',
        amount: amount,
        note: `${source === 'fund' ? 'دفع من الصندوق' : 'دفع بواسطة مستثمر'} للدين: ${debt.creditorName} - ${debt.description || ''}`,
        date: date,
        relatedDebtId: debtId
      }, userProfile?.email);

      // Notify all investors about the expense (debt payment)
      if (source === 'fund') {
        await notifyAllInvestors(
          'notifications.types.debt_payment_fund',
          'notifications.messages.debt_payment_fund',
          'expense',
          expenseId,
          { amount: amount.toLocaleString(), currency: 'ل.س', creditor: debt.creditorName }
        );
      }

      // If paid by specific investors, also create contribution records for them
      if (source === 'investors' && investorPayments) {
        for (const [investorId, paidAmount] of Object.entries(investorPayments)) {
          if (paidAmount > 0) {
            const investor = (investors || []).find(inv => String(inv.id || inv.uid) === String(investorId));
            if (investor) {
              const contributionId = await addTransaction({
                type: 'contribution',
                investorId: investor.id || investor.uid,
                investorName: investor.name,
                amount: paidAmount,
                note: `مساهمة شخصية في دفع دين (تم تقييدها كدين للمستثمر): ${debt.creditorName}`,
                date: date,
                relatedDebtId: debtId
              }, userProfile?.email);

              // Notify all about the specific investor's contribution
              await notifyAllInvestors(
                'notifications.types.debt_payment_investor',
                'notifications.messages.debt_payment_investor',
                'contribution',
                contributionId,
                { amount: paidAmount.toLocaleString(), currency: 'ل.س', creditor: debt.creditorName, name: investor.name }
              );
            }
          }
        }
      }

      // 2. Update Debt record
      const newPaidAmount = (debt.paidAmount || 0) + amount;
      const updatedPayments = [...(debt.payments || []), {
        amount,
        source,
        date,
        investorPayments: investorPayments || null, // Firebase doesn't accept undefined
        confirmedBy: userProfile?.investorName || 'Admin',
        confirmedAt: new Date().toISOString()
      }];

      const updates = {
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, debt.totalAmount - newPaidAmount),
        status: newPaidAmount >= debt.totalAmount ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending'),
        payments: updatedPayments
      };

      // Ensure no undefined values are sent to Firebase
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
          delete updates[key];
        }
      });

      await updateDebt(debtId, updates, userProfile?.email);

      await addLog({
        type: 'confirm_debt_payment',
        message: `Confirmed payment for ${debt.creditorName}: ${amount} SYP from ${source}`,
        user: userProfile?.investorName || 'Admin',
        details: paymentData
      });

    } catch (error) {
      console.error("Error confirming debt payment:", error);
      alert("خطأ في تأكيد الدفع");
    }
  };

  const handleUpdateDebt = async (id, updates) => {
    try {
      await updateDebt(id, updates, userProfile?.email);
      await addLog({
        type: 'update_debt',
        message: `Updated debt for: ${updates.creditorName}`,
        user: userProfile?.investorName || 'Admin',
        details: updates
      });
    } catch (error) {
      console.error("Error updating debt:", error);
      alert("خطأ في تحديث الدين");
    }
  };

  const handleDeleteDebt = async (id) => {
    try {
      await deleteDebt(id);
      await addLog({
        type: 'delete_debt',
        message: `Deleted debt record`,
        user: userProfile?.investorName || 'Admin',
        details: { id }
      });
    } catch (error) {
      console.error("Error deleting debt:", error);
      alert("خطأ في حذف الدين");
    }
  };

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
    handleImportData,
    handleAddChickenRecord,
    handleDeleteChickenRecord,
    handleAddFeedRecord,
    handleDeleteFeedRecord,
    handleArchiveCycle,
    handleAddDebt,
    handleUpdateDebt,
    handleDeleteDebt,
    handleAddDebtPayment
  }
}
