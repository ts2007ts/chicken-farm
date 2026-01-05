import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

beforeEach(() => {
  localStorageMock.getItem.mockReturnValue('ar');
  localStorageMock.setItem.mockClear();
});

// Test component to access context
function TestComponent() {
  const { language, t, toggleLanguage } = useLanguage();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="dashboard-title">{t.common.dashboard}</div>
      <button onClick={toggleLanguage} data-testid="toggle-btn">Toggle</button>
    </div>
  );
}

describe('LanguageContext', () => {
  it('provides default language as Arabic', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId('language')).toHaveTextContent('ar');
  });

  it('provides Arabic translations by default', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('لوحة التحكم');
  });

  it('toggles language when toggleLanguage is called', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const toggleBtn = screen.getByTestId('toggle-btn');
    const languageDisplay = screen.getByTestId('language');
    
    expect(languageDisplay).toHaveTextContent('ar');
    
    toggleBtn.click();
    
    // After toggle, should be English
    expect(languageDisplay).toHaveTextContent('en');
  });

  it('persists language to localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const toggleBtn = screen.getByTestId('toggle-btn');
    toggleBtn.click();
    
    expect(setItemSpy).toHaveBeenCalledWith('language', 'en');
    
    setItemSpy.mockRestore();
  });
});
