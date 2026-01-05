import { useState, useEffect } from 'react'
import { FAMILIES, EXPENSE_CATEGORIES } from '../constants'
import Modal from './Modal'
import { 
  CapitalForm, 
  ExpenseForm, 
  ContributionForm, 
  EggForm, 
  SettlementForm, 
  EditTransactionForm, 
  ImportExportForm,
  ChickenForm,
  FeedForm,
  ArchiveForm
} from './forms'
import Dashboard from './dashboard/Dashboard'
import InvestorList from './investors/InvestorList'
import TransactionList from './transactions/TransactionList'
import EggManagement from './eggs/EggManagement'
import InventoryTab from './inventory/InventoryTab'
import SuperAdminDashboard from './admin/SuperAdminDashboard'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useAppData } from '../hooks/useAppData'
import { useCalculations } from '../hooks/useCalculations'
import { useFilters } from '../hooks/useFilters'
import { useActions } from '../hooks/useActions'
import { useModals } from '../hooks/useModals'

function MainContent({ activeTab, showImportExportModal, setShowImportExportModal }) {
  const { currentUser, userProfile, isAdmin, isSuperAdmin } = useAuth()
  const { t, language } = useLanguage()
  const { investors, transactions, eggs, settings, chickenInventory, feedInventory, archives, loading } = useAppData(currentUser)
  const calculations = useCalculations(investors, transactions, eggs, settings)
  const filters = useFilters(transactions)
  const actions = useActions(investors, userProfile)
  const modals = useModals()

  const handleAddEggsWithFamilies = (quantity, note) => {
    actions.handleAddEggs(quantity, note, families)
  }

  // Sync external showImportExportModal prop with local modal state if needed
  useEffect(() => {
    if (showImportExportModal !== undefined) {
      modals.setShowImportExportModal(showImportExportModal)
    }
  }, [showImportExportModal])

  // Sync back to parent if local state changes
  useEffect(() => {
    if (setShowImportExportModal) {
      setShowImportExportModal(modals.showImportExportModal)
    }
  }, [modals.showImportExportModal])

  const categories = settings?.expense_categories?.list || EXPENSE_CATEGORIES(t)
  const families = settings?.family_settings?.list || FAMILIES(t)


  const [selectedInvestorForDetails, setSelectedInvestorForDetails] = useState(null)
  const [showChickenModal, setShowChickenModal] = useState(false)
  const [showFeedModal, setShowFeedModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)

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
      {activeTab === 'super_admin' && isSuperAdmin() && (
        <SuperAdminDashboard 
          investors={investors}
          transactions={transactions}
          calculations={calculations}
          chickenInventory={chickenInventory}
          feedInventory={feedInventory}
          archives={archives}
        />
      )}

      {activeTab === 'dashboard' && (
        <Dashboard 
          {...calculations}
          investors={investors}
          categories={categories}
          filteredTransactions={filters.filteredTransactions}
          setShowCapitalModal={modals.setShowCapitalModal}
          setShowExpenseModal={modals.setShowExpenseModal}
          setShowContributionModal={modals.setShowContributionModal}
          setShowEggModal={modals.setShowEggModal}
          eggs={eggs}
          transactions={transactions}
          families={families}
          settings={settings}
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
          categories={categories}
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
          getInvestorEggs={calculations.getInvestorEggs}
          getFamilyEggs={calculations.getFamilyEggs}
          eggs={eggs}
          families={families}
          isAdmin={isAdmin}
          handleDeleteEgg={actions.handleDeleteEgg}
          handleConfirmEggDelivery={(eggId, familyId) => actions.handleConfirmEggDelivery(eggId, familyId, eggs)}
          handleRejectEggDelivery={(eggId, familyId) => actions.handleRejectEggDelivery(eggId, familyId, eggs, families, settings)}
          setShowEggModal={modals.setShowEggModal}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryTab 
          {...calculations}
          transactions={transactions}
          investors={investors}
          categories={categories}
          families={families}
          selectedInvestorForDetails={selectedInvestorForDetails}
          setSelectedInvestorForDetails={setSelectedInvestorForDetails}
          isAdmin={isAdmin}
          userProfile={userProfile}
          chickenInventory={chickenInventory}
          feedInventory={feedInventory}
          archives={archives}
          onAddChicken={() => setShowChickenModal(true)}
          onAddFeed={() => setShowFeedModal(true)}
          onArchiveCycle={() => setShowArchiveModal(true)}
          onDeleteChicken={actions.handleDeleteChickenRecord}
          onDeleteFeed={actions.handleDeleteFeedRecord}
        />
      )}

      {/* Modals */}
      {showArchiveModal && (
        <Modal title={t?.eggs?.archives?.title || 'Archive'} onClose={() => setShowArchiveModal(false)}>
          <ArchiveForm 
            onSubmit={actions.handleArchiveCycle} 
            onClose={() => setShowArchiveModal(false)} 
          />
        </Modal>
      )}

      {showChickenModal && (
        <Modal title={t?.eggs?.chicken?.add || 'Add Chicken'} onClose={() => setShowChickenModal(false)}>
          <ChickenForm 
            onSubmit={actions.handleAddChickenRecord} 
            onClose={() => setShowChickenModal(false)} 
          />
        </Modal>
      )}

      {showFeedModal && (
        <Modal title={t?.eggs?.feed?.add || 'Add Feed'} onClose={() => setShowFeedModal(false)}>
          <FeedForm 
            onSubmit={actions.handleAddFeedRecord} 
            onClose={() => setShowFeedModal(false)} 
          />
        </Modal>
      )}

      {modals.showCapitalModal && (
        <Modal title={t.dashboard.setCapital} onClose={() => modals.setShowCapitalModal(false)}>
          <CapitalForm 
            investors={investors} 
            onSubmit={actions.handleSetCapital} 
            onClose={() => modals.setShowCapitalModal(false)} 
          />
        </Modal>
      )}

      {modals.showExpenseModal && (
        <Modal title={t.dashboard.addExpense} onClose={() => modals.setShowExpenseModal(false)}>
          <ExpenseForm 
            categories={categories} 
            onSubmit={actions.handleAddExpense} 
            onClose={() => modals.setShowExpenseModal(false)} 
          />
        </Modal>
      )}

      {modals.showContributionModal && (
        <Modal title={t.dashboard.addContribution} onClose={() => modals.setShowContributionModal(false)}>
          <ContributionForm 
            investors={investors} 
            onSubmit={actions.handleAddContribution} 
            onClose={() => modals.setShowContributionModal(false)} 
          />
        </Modal>
      )}

      {modals.showEggModal && (
        <Modal title={t.dashboard.recordEggs} onClose={() => modals.setShowEggModal(false)}>
          <EggForm 
            onSubmit={handleAddEggsWithFamilies} 
            onClose={() => modals.setShowEggModal(false)} 
          />
        </Modal>
      )}

      {modals.showImportExportModal && (
        <Modal title={t.common.importExport} onClose={() => modals.setShowImportExportModal(false)}>
          <ImportExportForm 
            onExport={actions.handleExportData} 
            onImport={actions.handleImportData} 
            onClose={() => modals.setShowImportExportModal(false)} 
          />
        </Modal>
      )}

      {modals.settlementInvestor && (
        <Modal title={`${t.investors.settleReceive} - ${modals.settlementInvestor.name}`} onClose={() => modals.setSettlementInvestor(null)}>
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
        <Modal title={t.common.edit} onClose={() => modals.setEditingTransaction(null)}>
          <EditTransactionForm 
            transaction={modals.editingTransaction}
            categories={categories}
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
