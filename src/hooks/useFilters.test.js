import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from './useFilters';

describe('useFilters', () => {
  const mockTransactions = [
    { id: '1', date: '2026-01-05', type: 'expense', category: 'feed', amount: 1000, note: 'Chicken feed', investorName: 'John' },
    { id: '2', date: '2026-01-04', type: 'contribution', amount: 500, note: 'Additional capital', investorName: 'Jane' },
    { id: '3', date: '2026-01-03', type: 'expense', category: 'medicine', amount: 200, note: 'Vaccines', investorName: 'Bob' },
  ];

  it('initializes with default values', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    
    expect(result.current.filterDate).toBe('');
    expect(result.current.filterCategory).toBe('all');
    expect(result.current.filterAmount).toBe('');
    expect(result.current.filterNotes).toBe('');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.transactionsPerPage).toBe(10);
  });

  it('returns all transactions when no filters applied', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    expect(result.current.filteredTransactions).toHaveLength(3);
  });

  it('filters by date correctly', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    
    act(() => {
      result.current.setFilterDate('2026-01-05');
    });
    
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0].id).toBe('1');
  });

  it('filters by category correctly', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    
    act(() => {
      result.current.setFilterCategory('expense');
    });
    
    expect(result.current.filteredTransactions).toHaveLength(2);
  });

  it('filters by amount correctly', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    
    act(() => {
      result.current.setFilterAmount('500');
    });
    
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0].amount).toBe(500);
  });

  it('filters by notes correctly', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    
    act(() => {
      result.current.setFilterNotes('feed');
    });
    
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0].note).toContain('feed');
  });

  it('filters by investor name correctly', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    
    act(() => {
      result.current.setFilterNotes('Jane');
    });
    
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0].investorName).toBe('Jane');
  });

  it('applies multiple filters simultaneously', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    
    act(() => {
      result.current.setFilterCategory('expense');
      result.current.setFilterAmount('1000');
    });
    
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0].id).toBe('1');
  });

  it('updates current page', () => {
    const { result } = renderHook(() => useFilters(mockTransactions));
    
    act(() => {
      result.current.setCurrentPage(2);
    });
    
    expect(result.current.currentPage).toBe(2);
  });
});
