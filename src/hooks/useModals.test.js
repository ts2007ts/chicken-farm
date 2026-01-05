import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModals } from './useModals';

describe('useModals', () => {
  it('initializes all modals as closed', () => {
    const { result } = renderHook(() => useModals());
    
    expect(result.current.showCapitalModal).toBe(false);
    expect(result.current.showExpenseModal).toBe(false);
    expect(result.current.showEggModal).toBe(false);
    expect(result.current.showContributionModal).toBe(false);
    expect(result.current.showImportExportModal).toBe(false);
    expect(result.current.editingTransaction).toBeNull();
    expect(result.current.settlementInvestor).toBeNull();
  });

  it('toggles capital modal', () => {
    const { result } = renderHook(() => useModals());
    
    act(() => {
      result.current.setShowCapitalModal(true);
    });
    
    expect(result.current.showCapitalModal).toBe(true);
    
    act(() => {
      result.current.setShowCapitalModal(false);
    });
    
    expect(result.current.showCapitalModal).toBe(false);
  });

  it('toggles expense modal', () => {
    const { result } = renderHook(() => useModals());
    
    act(() => {
      result.current.setShowExpenseModal(true);
    });
    
    expect(result.current.showExpenseModal).toBe(true);
  });

  it('sets editing transaction', () => {
    const { result } = renderHook(() => useModals());
    const mockTransaction = { id: '1', amount: 100, type: 'expense' };
    
    act(() => {
      result.current.setEditingTransaction(mockTransaction);
    });
    
    expect(result.current.editingTransaction).toEqual(mockTransaction);
  });

  it('sets settlement investor', () => {
    const { result } = renderHook(() => useModals());
    const mockInvestor = { id: '1', name: 'John Doe' };
    
    act(() => {
      result.current.setSettlementInvestor(mockInvestor);
    });
    
    expect(result.current.settlementInvestor).toEqual(mockInvestor);
  });

  it('clears editing transaction', () => {
    const { result } = renderHook(() => useModals());
    const mockTransaction = { id: '1', amount: 100 };
    
    act(() => {
      result.current.setEditingTransaction(mockTransaction);
    });
    
    expect(result.current.editingTransaction).toEqual(mockTransaction);
    
    act(() => {
      result.current.setEditingTransaction(null);
    });
    
    expect(result.current.editingTransaction).toBeNull();
  });

  it('handles multiple modals open simultaneously', () => {
    const { result } = renderHook(() => useModals());
    
    act(() => {
      result.current.setShowCapitalModal(true);
      result.current.setShowExpenseModal(true);
      result.current.setShowEggModal(true);
    });
    
    expect(result.current.showCapitalModal).toBe(true);
    expect(result.current.showExpenseModal).toBe(true);
    expect(result.current.showEggModal).toBe(true);
  });
});
