import { useState, useEffect } from 'react'
import { INITIAL_INVESTORS, EXPENSE_CATEGORIES, FAMILIES } from './constants'
import { formatNumber, formatDate, formatBalance } from './utils/helpers'
import Modal from './components/Modal'
import { 
  CapitalForm, 
  ExpenseForm, 
  ContributionForm, 
  EggForm, 
  SettlementForm, 
  EditTransactionForm, 
  ImportExportForm 
} from './components/forms'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import UserMenu from './components/UserMenu'
import AdminUserManager from './components/AdminUserManager'
import {
  subscribeToInvestors,
  subscribeToTransactions,
  subscribeToEggs,
  updateInvestor,
  addTransaction,
  updateTransaction as updateTransactionFirestore,
  deleteTransaction as deleteTransactionFirestore,
  addEgg,
  updateEgg as updateEggFirestore,
  deleteEgg as deleteEggFirestore,
  initializeInvestors,
  importAllData,
  exportAllData
} from './firebase/firestore'

function App() {
  const { currentUser, userProfile, isAdmin, canEditInvestor, canEditGeneral } = useAuth()

  // State
  const [investors, setInvestors] = useState(INITIAL_INVESTORS)
  const [transactions, setTransactions] = useState([])
  const [eggs, setEggs] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCapitalModal, setShowCapitalModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showEggModal, setShowEggModal] = useState(false)
  const [showContributionModal, setShowContributionModal] = useState(false)
  const [showImportExportModal, setShowImportExportModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [settlementInvestor, setSettlementInvestor] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 10
  const [selectedInvestorForDetails, setSelectedInvestorForDetails] = useState(null)

  // Firebase Subscriptions
  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    // Initialize investors in Firestore if they don't exist
    initializeInvestors(INITIAL_INVESTORS)

    // Subscribe to real-time updates
    const unsubInvestors = subscribeToInvestors((data) => {
      // Merge gender from INITIAL_INVESTORS
      const merged = data.map(inv => {
        const initialInv = INITIAL_INVESTORS.find(i => i.id === inv.id)
        return { ...inv, gender: initialInv?.gender || 'male' }
      })
      setInvestors(merged.length > 0 ? merged : INITIAL_INVESTORS)
    })

    const unsubTransactions = subscribeToTransactions((data) => {
      setTransactions(data)
    })

    const unsubEggs = subscribeToEggs((data) => {
      setEggs(data)
    })

    setLoading(false)

    return () => {
      unsubInvestors()
      unsubTransactions()
      unsubEggs()
    }
  }, [currentUser])

  // Update selected investor when profile changes (e.g., after login/logout)
  useEffect(() => {
    if (userProfile?.investorId) {
      setSelectedInvestorForDetails(userProfile.investorId)
    } else {
      setSelectedInvestorForDetails(null)
    }
  }, [userProfile])

  // Calculations
  const totalInitialCapital = investors.reduce((sum, inv) => sum + inv.initialCapital, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const totalContributions = transactions.filter(t => t.type === 'contribution').reduce((sum, t) => sum + t.amount, 0)
  const totalSettlementsIn = transactions.filter(t => t.type === 'settlement' && t.settlementType === 'pay').reduce((sum, t) => sum + t.amount, 0)
  const totalSettlementsOut = transactions.filter(t => t.type === 'settlement' && t.settlementType === 'receive').reduce((sum, t) => sum + t.amount, 0)
  const totalEggs = eggs.reduce((sum, e) => sum + e.quantity, 0)
  const balance = totalInitialCapital + totalContributions - totalExpenses + totalSettlementsIn - totalSettlementsOut

  // Helper Functions
  const getInvestorShare = (investor) => {
    if (totalInitialCapital === 0) return 0
    return ((investor.initialCapital / totalInitialCapital) * 100).toFixed(2)
  }

  const getInvestorContributions = (investorId) => {
    return transactions
      .filter(t => t.type === 'contribution' && t.investorId === investorId)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getInvestorSettlementsPaid = (investorId) => {
    return transactions
      .filter(t => t.type === 'settlement' && t.investorId === investorId && t.settlementType === 'pay')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getInvestorSettlementsReceived = (investorId) => {
    return transactions
      .filter(t => t.type === 'settlement' && t.investorId === investorId && t.settlementType === 'receive')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getInvestorBalance = (investor) => {
    const investorCount = investors.filter(inv => inv.initialCapital > 0).length || 1
    const expensePerPerson = totalExpenses / investorCount
    const contributions = getInvestorContributions(investor.id)
    const settlementsPaid = getInvestorSettlementsPaid(investor.id)
    const settlementsReceived = getInvestorSettlementsReceived(investor.id)
    return (investor.initialCapital - expensePerPerson + contributions + settlementsPaid - settlementsReceived).toFixed(2)
  }

  const getInvestorEggs = (investor) => {
    const family = FAMILIES.find(f => f.members.includes(investor.id))
    if (!family) return 0
    return Math.floor(totalEggs / 3)
  }

  const getFamilyEggs = () => Math.floor(totalEggs / 3)

  // Handlers
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

  const handleConfirmEggDelivery = async (eggId, familyId) => {
    try {
      const egg = eggs.find(e => e.id === eggId)
      const family = FAMILIES.find(f => f.id === familyId)
      const deliveries = egg.deliveries || {}
      
      await updateEggFirestore(eggId, { 
        deliveries: {
          ...deliveries,
          [familyId]: {
            delivered: true,
            deliveredAt: new Date().toISOString(),
            deliveredBy: family.name,
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
      alert(`تم استيراد البيانات بنجاح!\n\n✅ ${results.investors} مستثمر\n✅ ${results.transactions} معاملة\n✅ ${results.eggs} سجل بيض`)
    } catch (error) {
      console.error('Import error:', error)
      alert('خطأ في قراءة الملف. تأكد من صحة الملف.')
    }
  }

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage />
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">🐔</div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl">🐔</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">مزرعة الدجاج</h1>
                <p className="text-amber-100 text-xs sm:text-sm hidden sm:block">نظام إدارة المزرعة والمستثمرين</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {isAdmin() && (
                <button
                  onClick={() => setShowImportExportModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">📁 استيراد/تصدير</span>
                  <span className="sm:hidden">📁</span>
                </button>
              )}
              <div className="text-left">
                <p className="text-amber-100 text-xs sm:text-sm">الرصيد الحالي</p>
                <p className={`text-lg sm:text-2xl font-bold ${balance < 0 ? 'text-red-200' : ''}`}>
                  {balance < 0 ? `(${formatNumber(Math.abs(balance))})` : formatNumber(balance)} ل.س
                </p>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'dashboard', name: 'لوحة التحكم', icon: '📊' },
              { id: 'investors', name: 'المستثمرين', icon: '👥' },
              { id: 'expenses', name: 'المصروفات', icon: '💰' },
              { id: 'eggs', name: 'البيض', icon: '🥚' },
              { id: 'inventory', name: 'الجرد', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-4 py-2 sm:py-3 font-medium transition-all whitespace-nowrap text-xs sm:text-base ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <span className="text-2xl sm:text-base sm:ml-2">{tab.icon}</span>
                <span className="text-sm sm:text-base">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-green-500">
                <p className="text-gray-500 text-sm">رأس المال</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(totalInitialCapital)}</p>
                <p className="text-gray-400 text-xs">ل.س</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-red-500">
                <p className="text-gray-500 text-sm">المصروفات</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(totalExpenses)}</p>
                <p className="text-gray-400 text-xs">ل.س</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-blue-500">
                <p className="text-gray-500 text-sm">الإضافات</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(totalContributions)}</p>
                <p className="text-gray-400 text-xs">ل.س</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-amber-500">
                <p className="text-gray-500 text-sm">إجمالي البيض</p>
                <p className="text-2xl font-bold text-amber-600">{formatNumber(totalEggs)}</p>
                <p className="text-gray-400 text-xs">بيضة</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => setShowCapitalModal(true)} className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 transition-all transform hover:scale-105">
                  <span className="text-2xl block mb-1">💵</span>
                  <span className="text-sm">تعيين رأس المال</span>
                </button>
                <button onClick={() => setShowExpenseModal(true)} className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-4 transition-all transform hover:scale-105">
                  <span className="text-2xl block mb-1">📝</span>
                  <span className="text-sm">إضافة مصروف</span>
                </button>
                <button onClick={() => setShowContributionModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 transition-all transform hover:scale-105">
                  <span className="text-2xl block mb-1">➕</span>
                  <span className="text-sm">إضافة للرأسمال</span>
                </button>
                <button onClick={() => setShowEggModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg p-4 transition-all transform hover:scale-105">
                  <span className="text-2xl block mb-1">🥚</span>
                  <span className="text-sm">تسجيل بيض</span>
                </button>
              </div>
            </div>

            {/* Investors Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">ملخص حصص المستثمرين</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {investors.map(investor => (
                  <div key={investor.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">{investor.name}</span>
                      <span className="text-amber-600 font-bold">{getInvestorShare(investor)}%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>رأس المال: <span className="font-medium">{formatNumber(investor.initialCapital)}</span></p>
                      <p>الرصيد: <span className={`font-medium ${formatBalance(getInvestorBalance(investor)).isNegative ? 'text-red-600' : 'text-green-600'}`}>{formatBalance(getInvestorBalance(investor)).text} ل.س</span></p>
                      <p>البيض: <span className="font-medium text-amber-600">{formatNumber(getInvestorEggs(investor))}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">آخر المعاملات</h2>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد معاملات بعد</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transactions.slice(0, 10).map(transaction => (
                    <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      transaction.type === 'expense' ? 'bg-red-50' : 
                      transaction.type === 'settlement' ? 'bg-purple-50' : 'bg-green-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {transaction.type === 'expense' 
                            ? EXPENSE_CATEGORIES.find(c => c.id === transaction.category)?.icon || '📦'
                            : transaction.type === 'settlement'
                            ? (transaction.settlementType === 'receive' ? '💰' : '💳')
                            : '➕'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">
                            {transaction.type === 'expense' 
                              ? EXPENSE_CATEGORIES.find(c => c.id === transaction.category)?.name
                              : transaction.type === 'settlement'
                              ? `تصفية ${transaction.investorName} (${transaction.settlementType === 'receive' ? 'استلام' : 'دفع'})`
                              : `إضافة من ${transaction.investorName}`}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.note}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${
                          transaction.type === 'expense' ? 'text-red-600' : 
                          transaction.type === 'settlement' ? 'text-purple-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'expense' ? '-' : 
                           transaction.type === 'settlement' ? '⚖️ ' : '+'}{formatNumber(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Investors Tab */}
        {activeTab === 'investors' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">المستثمرين</h2>
              <button onClick={() => setShowCapitalModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base w-full sm:w-auto">
                تعيين رأس المال
              </button>
            </div>
            <div className="grid gap-4 sm:gap-6">
              {investors.map(investor => (
                <div key={investor.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                        {investor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-800">{investor.name}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">نسبة الحصة: {getInvestorShare(investor)}%</p>
                      </div>
                    </div>
                    <div className="text-right sm:text-left w-full sm:w-auto">
                      <p className="text-gray-500 text-xs sm:text-sm">رأس المال الحالي</p>
                      <p className="text-lg sm:text-xl font-bold text-amber-600">{formatNumber(investor.initialCapital)} ل.س</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-gray-500 text-sm">رأس المال الأولي</p>
                      <p className="font-bold text-gray-800">{formatNumber(investor.initialCapital)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">الرصيد المتوقع</p>
                      <p className={`font-bold ${formatBalance(getInvestorBalance(investor)).isNegative ? 'text-red-600' : 'text-green-600'}`}>{formatBalance(getInvestorBalance(investor)).text} ل.س</p>
                    </div>
                  </div>
                  {parseFloat(getInvestorBalance(investor)) !== 0 && (isAdmin() || userProfile?.investorId === investor.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setSettlementInvestor(investor)}
                        className={`w-full py-2 rounded-lg font-bold transition-all ${
                          parseFloat(getInvestorBalance(investor)) > 0
                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }`}
                      >
                        {parseFloat(getInvestorBalance(investor)) > 0
                          ? '💰 تصفية (استلام من الصندوق)'
                          : '💳 تصفية (دفع للصندوق)'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">المصروفات والإضافات</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setShowExpenseModal(true)} className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base">
                  إضافة مصروف
                </button>
                <button onClick={() => setShowContributionModal(true)} className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base">
                  إضافة للرأسمال
                </button>
              </div>
            </div>

            {/* Expense Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">ملخص المصروفات حسب الفئة</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {EXPENSE_CATEGORIES.map(category => {
                  const categoryTotal = transactions
                    .filter(t => t.type === 'expense' && t.category === category.id)
                    .reduce((sum, t) => sum + t.amount, 0)
                  return (
                    <div key={category.id} className="bg-gray-50 rounded-lg p-3 text-center">
                      <span className="text-2xl">{category.icon}</span>
                      <p className="text-sm text-gray-600 mt-1">{category.name}</p>
                      <p className="font-bold text-red-600">{formatNumber(categoryTotal)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">سجل المعاملات</h3>
                <span className="text-sm text-gray-500">إجمالي: {transactions.length} معاملة</span>
              </div>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد معاملات بعد</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {transactions
                      .slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage)
                      .map(transaction => (
                      <div key={transaction.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-2 sm:gap-0 ${
                        transaction.type === 'expense' ? 'bg-red-50' : 
                        transaction.type === 'settlement' ? 'bg-purple-50' : 'bg-green-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {transaction.type === 'expense' 
                              ? EXPENSE_CATEGORIES.find(c => c.id === transaction.category)?.icon || '📦'
                              : transaction.type === 'settlement'
                              ? (transaction.settlementType === 'receive' ? '💰' : '💳')
                              : '➕'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800">
                              {transaction.type === 'expense' 
                                ? EXPENSE_CATEGORIES.find(c => c.id === transaction.category)?.name
                                : transaction.type === 'settlement'
                                ? `تصفية ${transaction.investorName} (${transaction.settlementType === 'receive' ? 'استلام' : 'دفع'})`
                                : `إضافة من ${transaction.investorName}`}
                            </p>
                            <p className="text-sm text-gray-500">{transaction.note}</p>
                            <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-left">
                            <p className={`font-bold text-base sm:text-lg ${
                              transaction.type === 'expense' ? 'text-red-600' : 
                              transaction.type === 'settlement' ? 'text-purple-600' : 'text-green-600'
                            }`}>
                              {transaction.type === 'expense' ? '-' : 
                               transaction.type === 'settlement' ? '⚖️ ' : '+'}{formatNumber(transaction.amount)} ل.س
                            </p>
                          </div>
                          <button onClick={() => setEditingTransaction(transaction)} className="text-gray-400 hover:text-blue-500 transition-colors">✏️</button>
                          <button onClick={() => handleDeleteTransaction(transaction.id)} className="text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {transactions.length > transactionsPerPage && (
                    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">««</button>
                      <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">«</button>
                      <span className="px-4 py-1 text-sm text-gray-600">صفحة {currentPage} من {Math.ceil(transactions.length / transactionsPerPage)}</span>
                      <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(transactions.length / transactionsPerPage)))} disabled={currentPage === Math.ceil(transactions.length / transactionsPerPage)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">»</button>
                      <button onClick={() => setCurrentPage(Math.ceil(transactions.length / transactionsPerPage))} disabled={currentPage === Math.ceil(transactions.length / transactionsPerPage)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">»»</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Eggs Tab */}
        {activeTab === 'eggs' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">سجل البيض</h2>
              <button onClick={() => setShowEggModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base w-full sm:w-auto">
                تسجيل بيض جديد
              </button>
            </div>

            {/* Egg Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 md:p-10">
              <h3 className="font-bold text-gray-800 mb-4">توزيع البيض على العائلات</h3>
              <div className="text-center mb-6">
                <span className="text-5xl">🥚</span>
                <p className="text-3xl font-bold text-amber-600 mt-2">{formatNumber(totalEggs)}</p>
                <p className="text-gray-500">إجمالي البيض</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FAMILIES.map(family => (
                  <div key={family.id} className="bg-amber-50 rounded-lg p-4 text-center">
                    <span className="text-3xl">{family.icon}</span>
                    <p className="font-bold text-gray-800 mt-2">{family.name}</p>
                    <p className="text-2xl font-bold text-amber-600">{formatNumber(getFamilyEggs())}</p>
                    <p className="text-sm text-gray-500">بيضة (33.33%)</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Egg Records */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">سجل إنتاج البيض</h3>
              {eggs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا يوجد سجل للبيض بعد</p>
              ) : (
                <div className="space-y-4">
                  {eggs.map(egg => (
                    <div key={egg.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-amber-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🥚</span>
                          <div>
                            <p className="font-bold text-gray-800">{formatNumber(egg.quantity)} بيضة</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(egg.date)} - {egg.note || 'بدون ملاحظات'}
                              {egg.recordedBy && <span className="mr-2 text-amber-700 font-medium">| سجل بواسطة: {egg.recordedBy}</span>}
                            </p>
                          </div>
                        </div>
                        {isAdmin() && (
                          <button onClick={() => handleDeleteEgg(egg.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors" title="حذف السجل بالكامل">🗑️</button>
                        )}
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {FAMILIES.map(family => {
                          const delivery = egg.deliveries?.[family.id]
                          const isDelivered = delivery?.delivered
                          return (
                            <div key={family.id} className={`p-3 rounded-lg border ${isDelivered ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{family.icon}</span>
                                  <span className="text-sm font-bold text-gray-700">{family.name}</span>
                                </div>
                                {isDelivered ? (
                                  <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">تم الاستلام ✅</span>
                                ) : (
                                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">بانتظار الاستلام ⏳</span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-500 mb-3">
                                {isDelivered ? (
                                  <>
                                    <p>المستلم: {delivery.deliveredBy}</p>
                                    <p>التاريخ: {formatDate(delivery.deliveredAt)}</p>
                                  </>
                                ) : (
                                  <p>الحصة: {formatNumber(Math.floor(egg.quantity / 3))} بيضة</p>
                                )}
                              </div>
                              {!isDelivered && isAdmin() && (
                                <button 
                                  onClick={() => handleConfirmEggDelivery(egg.id, family.id)}
                                  className="w-full bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-md text-xs font-bold transition-all"
                                >
                                  تأكيد استلام العائلة
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">جرد المزرعة</h2>

            {/* Financial Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">الملخص المالي للصندوق</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">إجمالي رأس المال</span>
                  <span className="font-bold text-green-600">{formatNumber(totalInitialCapital)} ل.س</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">إجمالي الإضافات</span>
                  <span className="font-bold text-blue-600">+{formatNumber(totalContributions)} ل.س</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700">إجمالي المصروفات</span>
                  <span className="font-bold text-red-600">-{formatNumber(totalExpenses)} ل.س</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">تصفيات (دفع للصندوق)</span>
                  <span className="font-bold text-purple-600">+{formatNumber(totalSettlementsIn)} ل.س</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">تصفيات (استلام من الصندوق)</span>
                  <span className="font-bold text-purple-600">-{formatNumber(totalSettlementsOut)} ل.س</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2 font-medium">طريقة الحساب:</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {formatNumber(totalInitialCapital)} + {formatNumber(totalContributions)} - {formatNumber(totalExpenses)} + {formatNumber(totalSettlementsIn)} - {formatNumber(totalSettlementsOut)} = {balance < 0 ? `(${formatNumber(Math.abs(balance))})` : formatNumber(balance)}
                  </p>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border-2 border-amber-300">
                  <span className="text-gray-800 font-bold">الرصيد الحالي للصندوق</span>
                  <span className={`font-bold text-2xl ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>{balance < 0 ? `(${formatNumber(Math.abs(balance))})` : formatNumber(balance)} ل.س</span>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">تفصيل المصروفات</h3>
              <div className="space-y-3">
                {EXPENSE_CATEGORIES.map(category => {
                  const categoryTotal = transactions
                    .filter(t => t.type === 'expense' && t.category === category.id)
                    .reduce((sum, t) => sum + t.amount, 0)
                  const percentage = totalExpenses > 0 ? ((categoryTotal / totalExpenses) * 100).toFixed(1) : 0
                  return (
                    <div key={category.id} className="flex items-center gap-4">
                      <span className="text-2xl w-10">{category.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700">{category.name}</span>
                          <span className="font-medium text-gray-800">{formatNumber(categoryTotal)} ل.س</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-left">{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Investor Shares */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">حصص المستثمرين</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 text-gray-600">المستثمر</th>
                      <th className="text-right py-3 px-4 text-gray-600">رأس المال</th>
                      <th className="text-right py-3 px-4 text-gray-600">النسبة</th>
                      <th className="text-right py-3 px-4 text-gray-600">الرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investors.map(investor => (
                      <tr key={investor.id} className="border-b border-gray-100 hover:bg-amber-50">
                        <td className="py-3 px-4 font-medium">{investor.name}</td>
                        <td className="py-3 px-4">{formatNumber(investor.initialCapital)} ل.س</td>
                        <td className="py-3 px-4 text-amber-600 font-bold">{getInvestorShare(investor)}%</td>
                        <td className={`py-3 px-4 font-bold ${formatBalance(getInvestorBalance(investor)).isNegative ? 'text-red-600' : 'text-green-600'}`}>{formatBalance(getInvestorBalance(investor)).text} ل.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Investor Calculation Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">تفاصيل حساب المستثمر</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">اختر المستثمر لعرض تفاصيل الحساب:</label>
                <select
                  value={selectedInvestorForDetails || ''}
                  onChange={(e) => setSelectedInvestorForDetails(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={!isAdmin() && userProfile?.investorId}
                >
                  <option value="">-- اختر مستثمر --</option>
                  {(isAdmin() ? investors : investors.filter(inv => inv.id === userProfile?.investorId)).map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.name}</option>
                  ))}
                </select>
                {!isAdmin() && (
                  <p className="text-xs text-gray-400 mt-1">يمكنك عرض تفاصيل حسابك فقط</p>
                )}
              </div>
              
              {selectedInvestorForDetails && (() => {
                const investor = investors.find(inv => inv.id === selectedInvestorForDetails)
                if (!investor) return null
                const investorCount = investors.filter(inv => inv.initialCapital > 0).length || 1
                const expensePerPerson = totalExpenses / investorCount
                const contributions = getInvestorContributions(investor.id)
                const settlementsPaid = getInvestorSettlementsPaid(investor.id)
                const settlementsReceived = getInvestorSettlementsReceived(investor.id)
                const finalBalance = parseFloat(getInvestorBalance(investor))
                
                return (
                  <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                        {investor.name.charAt(0)}
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">{investor.name}</h4>
                      <p className="text-gray-500">نسبة الحصة: {getInvestorShare(investor)}%</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <h5 className="font-bold text-gray-700 border-b pb-2">تفصيل الحساب:</h5>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">1️⃣ رأس المال الأولي</span>
                        <span className="font-bold text-green-600">+{formatNumber(investor.initialCapital)} ل.س</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">2️⃣ حصة المصروفات ({formatNumber(totalExpenses)} ÷ {investorCount} مستثمر)</span>
                        <span className="font-bold text-red-600">-{formatNumber(expensePerPerson)} ل.س</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">3️⃣ إضافات للرأسمال</span>
                        <span className="font-bold text-blue-600">+{formatNumber(contributions)} ل.س</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">4️⃣ تصفيات (دفع للصندوق)</span>
                        <span className="font-bold text-purple-600">+{formatNumber(settlementsPaid)} ل.س</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">5️⃣ تصفيات (استلام من الصندوق)</span>
                        <span className="font-bold text-purple-600">-{formatNumber(settlementsReceived)} ل.س</span>
                      </div>
                      
                      <div className="border-t-2 border-gray-300 pt-3 mt-3">
                        <div className="bg-gray-100 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-600 font-medium mb-1">المعادلة:</p>
                          <p className="text-xs text-gray-700 font-mono">
                            {formatNumber(investor.initialCapital)} - {formatNumber(expensePerPerson)} + {formatNumber(contributions)} + {formatNumber(settlementsPaid)} - {formatNumber(settlementsReceived)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-800 font-bold text-lg">الرصيد النهائي</span>
                          <span className={`font-bold text-2xl ${finalBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {finalBalance < 0 ? `(${formatNumber(Math.abs(finalBalance))})` : formatNumber(finalBalance)} ل.س
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 rounded-lg bg-amber-100 border border-amber-300">
                        <p className="text-sm text-amber-800">
                          {finalBalance > 0 
                            ? `✅ ${investor.name} ${investor.gender === 'female' ? 'لها' : 'له'} رصيد ${formatNumber(finalBalance)} ل.س في الصندوق (${investor.gender === 'female' ? 'تستحق استلامه' : 'يستحق استلامه'})`
                            : finalBalance < 0
                            ? `⚠️ ${investor.name} ${investor.gender === 'female' ? 'عليها' : 'عليه'} ${formatNumber(Math.abs(finalBalance))} ل.س للصندوق (${investor.gender === 'female' ? 'يجب دفعها' : 'يجب دفعه'})`
                            : `✨ حساب ${investor.name} مُصفّى بالكامل`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Family Egg Shares */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">حصص العائلات من البيض</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FAMILIES.map(family => (
                  <div key={family.id} className="bg-amber-50 rounded-lg p-4 text-center">
                    <span className="text-3xl">{family.icon}</span>
                    <p className="font-bold text-gray-800 mt-2">{family.name}</p>
                    <p className="text-2xl font-bold text-amber-600">{formatNumber(getFamilyEggs())}</p>
                    <p className="text-sm text-gray-500">بيضة (33.33%)</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCapitalModal && (
        <Modal title="تعيين رأس المال" onClose={() => setShowCapitalModal(false)}>
          <CapitalForm investors={investors} onSubmit={handleSetCapital} onClose={() => setShowCapitalModal(false)} />
        </Modal>
      )}

      {showExpenseModal && (
        <Modal title="إضافة مصروف" onClose={() => setShowExpenseModal(false)}>
          <ExpenseForm categories={EXPENSE_CATEGORIES} onSubmit={handleAddExpense} onClose={() => setShowExpenseModal(false)} />
        </Modal>
      )}

      {showContributionModal && (
        <Modal title="إضافة للرأسمال" onClose={() => setShowContributionModal(false)}>
          <ContributionForm investors={investors} onSubmit={handleAddContribution} onClose={() => setShowContributionModal(false)} />
        </Modal>
      )}

      {showEggModal && (
        <Modal title="تسجيل بيض" onClose={() => setShowEggModal(false)}>
          <EggForm onSubmit={handleAddEggs} onClose={() => setShowEggModal(false)} />
        </Modal>
      )}

      {showImportExportModal && (
        <Modal title="استيراد / تصدير البيانات" onClose={() => setShowImportExportModal(false)}>
          <ImportExportForm onExport={handleExportData} onImport={handleImportData} onClose={() => setShowImportExportModal(false)} />
        </Modal>
      )}

      {settlementInvestor && (
        <Modal title={`تصفية حساب ${settlementInvestor.name}`} onClose={() => setSettlementInvestor(null)}>
          <SettlementForm 
            investor={settlementInvestor}
            balance={getInvestorBalance(settlementInvestor)}
            onSubmit={(amount, type, note, date) => {
              handleSettlement(settlementInvestor.id, amount, type, note, date)
              setSettlementInvestor(null)
            }}
            onClose={() => setSettlementInvestor(null)}
          />
        </Modal>
      )}

      {editingTransaction && (
        <Modal title="تعديل المعاملة" onClose={() => setEditingTransaction(null)}>
          <EditTransactionForm 
            transaction={editingTransaction}
            categories={EXPENSE_CATEGORIES}
            investors={investors}
            onSubmit={(updates) => {
              handleEditTransaction(editingTransaction.id, updates)
              setEditingTransaction(null)
            }}
            onClose={() => setEditingTransaction(null)}
          />
        </Modal>
      )}
    </div>
  )
}

export default App