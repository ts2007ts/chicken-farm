import { useState } from 'react'

export function useModals() {
  const [showCapitalModal, setShowCapitalModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showEggModal, setShowEggModal] = useState(false)
  const [showContributionModal, setShowContributionModal] = useState(false)
  const [showImportExportModal, setShowImportExportModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [settlementInvestor, setSettlementInvestor] = useState(null)

  return {
    showCapitalModal, setShowCapitalModal,
    showExpenseModal, setShowExpenseModal,
    showEggModal, setShowEggModal,
    showContributionModal, setShowContributionModal,
    showImportExportModal, setShowImportExportModal,
    editingTransaction, setEditingTransaction,
    settlementInvestor, setSettlementInvestor
  }
}
