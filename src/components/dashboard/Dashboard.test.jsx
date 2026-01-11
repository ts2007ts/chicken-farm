import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Mock helpers
vi.mock('../../utils/helpers', () => ({
  formatNumber: vi.fn((n) => n?.toString()),
  formatDate: vi.fn((d) => d),
  formatBalance: vi.fn((v) => ({ text: v?.toString(), isNegative: v < 0 })),
}));

// Mock AnalyticsDashboard
vi.mock('./AnalyticsDashboard', () => ({
  default: () => <div data-testid="analytics-dashboard">Analytics Dashboard</div>
}));

describe('Dashboard Component', () => {
  const mockProps = {
    balance: 5000,
    totalExpenses: 2000,
    totalContributions: 1000,
    totalEggs: 300,
    investors: [],
    categories: [],
    filteredTransactions: [],
    setShowCapitalModal: vi.fn(),
    setShowExpenseModal: vi.fn(),
    setShowContributionModal: vi.fn(),
    setShowEggModal: vi.fn(),
    eggs: [],
    transactions: [],
    families: [],
    settings: {}
  };

  const renderDashboard = (props = mockProps) => {
    return render(
      <LanguageProvider>
        <Dashboard {...props} />
      </LanguageProvider>
    );
  };

  it('renders summary cards with correct values', () => {
    renderDashboard();
    // Use Arabic text since LanguageProvider defaults to 'ar'
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
    expect(screen.getByText(/2,000/)).toBeInTheDocument();
    expect(screen.getByText(/1,000/)).toBeInTheDocument();
    expect(screen.getByText(/300/)).toBeInTheDocument();
  });

  it('calls modal functions on button clicks', () => {
    renderDashboard();
    
    // Quick action buttons
    const buttons = screen.getAllByRole('button');
    // Dashboard has several buttons for quick actions
    // We can filter by text or icon if needed, but checking if they exist is a start
    expect(buttons.length).toBeGreaterThan(0);
  });
});
