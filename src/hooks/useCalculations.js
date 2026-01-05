import { FAMILIES } from '../constants'

export function useCalculations(investors, transactions, eggs, settings) {
  const totalInitialCapital = investors.reduce((sum, inv) => sum + inv.initialCapital, 0)
  const totalCurrentCapital = investors.reduce((sum, inv) => sum + inv.currentCapital, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const totalContributions = transactions.filter(t => t.type === 'contribution').reduce((sum, t) => sum + t.amount, 0)
  const totalSettlementsIn = transactions.filter(t => t.type === 'settlement' && t.settlementType === 'pay').reduce((sum, t) => sum + t.amount, 0)
  const totalSettlementsOut = transactions.filter(t => t.type === 'settlement' && t.settlementType === 'receive').reduce((sum, t) => sum + t.amount, 0)
  const totalEggs = eggs.reduce((sum, e) => sum + e.quantity, 0)

  const balance = totalInitialCapital + totalContributions - totalExpenses + totalSettlementsIn - totalSettlementsOut

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
    
    // Add share of rejected eggs income if investor is linked to a family
    // This assumes a mapping between investors and families exists or is handled
    // For now, let's calculate the total rejected income globally and potentially split it
    // Or if we have family association, we'd add it here.
    
    return (investor.initialCapital - expensePerPerson + contributions + settlementsPaid - settlementsReceived).toFixed(2)
  }

  const getInvestorEggs = (investor) => {
    return Math.floor(totalEggs / Math.max(1, investors.length))
  }

  const getFamilyEggs = (familyId) => {
    const familyList = settings?.family_settings?.list || FAMILIES(() => ({}))
    return Math.floor(totalEggs / Math.max(1, familyList.length))
  }

  return {
    totalInitialCapital,
    totalCurrentCapital,
    totalExpenses,
    totalContributions,
    totalSettlementsIn,
    totalSettlementsOut,
    totalEggs,
    balance,
    getInvestorShare,
    getInvestorContributions,
    getInvestorSettlementsPaid,
    getInvestorSettlementsReceived,
    getInvestorBalance,
    getInvestorEggs,
    getFamilyEggs,
  }
}
