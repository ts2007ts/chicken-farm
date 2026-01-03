import { useState, useEffect } from 'react'
import { EXPENSE_CATEGORIES } from '../constants'
import Modal from './Modal'
import { 
  CapitalForm, 
  ExpenseForm, 
  ContributionForm, 
  EggForm, 
  SettlementForm, 
  EditTransactionForm, 
  ImportExportForm 
} from './forms'
import Dashboard from './dashboard/Dashboard'
import InvestorList from './investors/InvestorList'
import TransactionList from './transactions/TransactionList'
import EggManagement from './eggs/EggManagement'
import InventoryTab from './inventory/InventoryTab'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { useCalculations } from '../hooks/useCalculations'
import { useFilters } from '../hooks/useFilters'
import { useActions } from '../hooks/useActions'
import { useModals } from '../hooks/useModals'

function MainContent({ activeTab }) {
  const { currentUser, userProfile, isAdmin } = useAuth()
  const { investors, transactions, eggs, loading } = useAppData(currentUser)
  const calculations = useCalculations(investors, transactions, eggs)
  const filters = useFilters(transactions)
  const actions = useActions(investors, userProfile)
  const modals = useModals()

  const [selectedInvestorForDetails, setSelectedInvestorForDetails] = useState(null)

  useEffect(() => {
    if (userProfile?.investorId) {
      setSelectedInvestorForDetails(userProfile.investorId)
    } else {
      setSelectedInvestorForDetails(null)
    }
  }, [userProfile])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐔</div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {activeTab === 'dashboard' && (
        <Dashboard 
          {...calculations}
          investors={investors}
          filteredTransactions={filters.filteredTransactions}
          setShowCapitalModal={modals.setShowCapitalModal}
          setShowExpenseModal={modals.setShowExpenseModal}
          setShowContributionModal={modals.setShowContributionModal}
          setShowEggModal={modals.setShowEggModal}
        />
      )}

      {activeTab === 'investors' && (
        <InvestorList 
          investors={investors}
          getInvestorShare={calculations.getInvestorShare}
          getInvestorBalance={calculations.getInvestorBalance}
          setShowCapitalModal={modals.setShowCapitalModal}
          setSettlementInvestor={modals.setSettlementInvestor}
          isAdmin={isAdmin}
          userProfile={userProfile}
        />
      )}

      {activeTab === 'expenses' && (
        <TransactionList 
          transactions={transactions}
          {...filters}
          setShowExpenseModal={modals.setShowExpenseModal}
          setShowContributionModal={modals.setShowContributionModal}
          setEditingTransaction={modals.setEditingTransaction}
          handleDeleteTransaction={actions.handleDeleteTransaction}
        />
      )}

      {activeTab === 'eggs' && (
        <EggManagement 
          totalEggs={calculations.totalEggs}
          getFamilyEggs={calculations.getFamilyEggs}
          eggs={eggs}
          isAdmin={isAdmin}
          handleDeleteEgg={actions.handleDeleteEgg}
          handleConfirmEggDelivery={(eggId, familyId) => actions.handleConfirmEggDelivery(eggId, familyId, eggs)}
          setShowEggModal={modals.setShowEggModal}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryTab 
          {...calculations}
          transactions={transactions}
          investors={investors}
          selectedInvestorForDetails={selectedInvestorForDetails}
          setSelectedInvestorForDetails={setSelectedInvestorForDetails}
          isAdmin={isAdmin}
          userProfile={userProfile}
        />
      )}

      {/* Modals */}
      {modals.showCapitalModal && (
        <Modal title="تعيين رأس المال" onClose={() => modals.setShowCapitalModal(false)}>
          <CapitalForm 
            investors={investors} 
            onSubmit={actions.handleSetCapital} 
            onClose={() => modals.setShowCapitalModal(false)} 
          />
        </Modal>
      )}

      {modals.showExpenseModal && (
        <Modal title="إضافة مصروف" onClose={() => modals.setShowExpenseModal(false)}>
          <ExpenseForm 
            categories={EXPENSE_CATEGORIES} 
            onSubmit={actions.handleAddExpense} 
            onClose={() => modals.setShowExpenseModal(false)} 
          />
        </Modal>
      )}

      {modals.showContributionModal && (
        <Modal title="إضافة للرأسمال" onClose={() => modals.setShowContributionModal(false)}>
          <ContributionForm 
            investors={investors} 
            onSubmit={actions.handleAddContribution} 
            onClose={() => modals.setShowContributionModal(false)} 
          />
        </Modal>
      )}

      {modals.showEggModal && (
        <Modal title="تسجيل بيض" onClose={() => modals.setShowEggModal(false)}>
          <EggForm 
            onSubmit={actions.handleAddEggs} 
            onClose={() => modals.setShowEggModal(false)} 
          />
        </Modal>
      )}

      {modals.showImportExportModal && (
        <Modal title="استيراد / تصدير البيانات" onClose={() => modals.setShowImportExportModal(false)}>
          <ImportExportForm 
            onExport={actions.handleExportData} 
            onImport={actions.handleImportData} 
            onClose={() => modals.setShowImportExportModal(false)} 
          />
        </Modal>
      )}

      {modals.settlementInvestor && (
        <Modal title={`تصفية حساب ${modals.settlementInvestor.name}`} onClose={() => modals.setSettlementInvestor(null)}>
          <SettlementForm 
            investor={modals.settlementInvestor}
            balance={calculations.getInvestorBalance(modals.settlementInvestor)}
            onSubmit={(amount, type, note, date) => {
              actions.handleSettlement(modals.settlementInvestor.id, amount, type, note, date)
              modals.setSettlementInvestor(null)
            }}
            onClose={() => modals.setSettlementInvestor(null)}
          />
        </Modal>
      )}

      {modals.editingTransaction && (
        <Modal title="تعديل المعاملة" onClose={() => modals.setEditingTransaction(null)}>
          <EditTransactionForm 
            transaction={modals.editingTransaction}
            categories={EXPENSE_CATEGORIES}
            investors={investors}
            onSubmit={(updates) => {
              actions.handleEditTransaction(modals.editingTransaction.id, updates)
              modals.setEditingTransaction(null)
            }}
            onClose={() => modals.setEditingTransaction(null)}
          />
        </Modal>
      )}
    </>
  )
}

export default MainContent
