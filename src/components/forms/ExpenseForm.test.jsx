import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseForm from './ExpenseForm';

// Complete mock of AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: () => true,
    currentUser: { uid: 'admin-1' }
  }),
  AuthProvider: ({ children }) => <>{children}</>
}));

// Complete mock of LanguageContext
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      common: { 
        date: 'Date Label', 
        amount: 'Amount Label', 
        currency: 'SYP', 
        notes: 'Notes Label', 
        error: 'Error' 
      },
      expenses: { 
        category: 'Category Label', 
        addExpense: 'Submit Expense', 
        filterAmount: 'Enter Amount' 
      },
      categories: {}
    },
    language: 'ar'
  }),
  LanguageProvider: ({ children }) => <>{children}</>
}));

// Mock helpers to avoid any issues
vi.mock('../../utils/helpers', () => ({
  formatNumber: (n) => n,
  formatDate: (d) => d,
  formatBalance: (v) => ({ text: v, isNegative: false })
}));

describe('ExpenseForm Component', () => {
  const mockCategories = [
    { id: 'cat1', name: 'Feed', icon: '🌾' },
    { id: 'cat2', name: 'Medicine', icon: '💊' }
  ];
  
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  it('renders correctly', () => {
    render(
      <ExpenseForm 
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/Amount Label/i)).toBeInTheDocument();
  });
});
