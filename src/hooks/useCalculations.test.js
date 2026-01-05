import { describe, it, expect } from 'vitest';
import { useCalculations } from './useCalculations';

// Mock hook usage for non-react environment testing
const testCalculations = (investors, transactions, eggs, settings) => {
  return useCalculations(investors, transactions, eggs, settings);
};

describe('useCalculations', () => {
  const mockInvestors = [
    { id: '1', name: 'Inv 1', initialCapital: 1000, currentCapital: 1000 },
    { id: '2', name: 'Inv 2', initialCapital: 2000, currentCapital: 2000 },
  ];

  const mockTransactions = [
    { id: 't1', type: 'expense', amount: 500 },
    { id: 't2', type: 'contribution', amount: 200, investorId: '1' },
    { id: 't3', type: 'settlement', amount: 100, investorId: '2', settlementType: 'receive' },
    { id: 't4', type: 'settlement', amount: 50, investorId: '1', settlementType: 'pay' },
  ];

  const mockEggs = [
    { id: 'e1', quantity: 100 },
    { id: 'e2', quantity: 200 },
  ];

  it('calculates totals correctly', () => {
    const result = testCalculations(mockInvestors, mockTransactions, mockEggs, {});
    
    expect(result.totalInitialCapital).toBe(3000);
    expect(result.totalExpenses).toBe(500);
    expect(result.totalContributions).toBe(200);
    expect(result.totalSettlementsOut).toBe(100);
    expect(result.totalSettlementsIn).toBe(50);
    expect(result.totalEggs).toBe(300);
  });

  it('calculates balance correctly', () => {
    const result = testCalculations(mockInvestors, mockTransactions, mockEggs, {});
    // balance = initial (3000) + contributions (200) - expenses (500) + settlementsIn (50) - settlementsOut (100)
    // 3000 + 200 - 500 + 50 - 100 = 2650
    expect(result.balance).toBe(2650);
  });

  it('calculates investor share correctly', () => {
    const result = testCalculations(mockInvestors, mockTransactions, mockEggs, {});
    expect(result.getInvestorShare(mockInvestors[0])).toBe("33.33");
    expect(result.getInvestorShare(mockInvestors[1])).toBe("66.67");
  });

  it('calculates investor balance correctly', () => {
    const result = testCalculations(mockInvestors, mockTransactions, mockEggs, {});
    // Inv 1: initial (1000) - expShare (500/2=250) + contrib (200) + settIn (50) - settOut (0) = 1000 - 250 + 200 + 50 = 1000
    expect(result.getInvestorBalance(mockInvestors[0])).toBe("1000.00");
  });
});
