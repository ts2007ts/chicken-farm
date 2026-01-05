import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from './NotificationContext';

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user-123' }
  })
}));

// Mock Firestore
vi.mock('../firebase/firestore', () => ({
  subscribeToNotifications: vi.fn(() => () => {}),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn()
}));

// Test component to access context
function TestComponent() {
  const { notifications, addNotification, markAsRead, markAllAsRead } = useNotifications();
  
  return (
    <div>
      <div data-testid="notification-count">{notifications.length}</div>
      <button 
        onClick={() => addNotification('egg', 'New eggs recorded', { quantity: 100 })}
        data-testid="add-btn"
      >
        Add
      </button>
      <button 
        onClick={() => notifications[0] && markAsRead(notifications[0].id)}
        data-testid="mark-read-btn"
      >
        Mark Read
      </button>
      <button onClick={markAllAsRead} data-testid="mark-all-btn">
        Mark All
      </button>
      {notifications.map(n => (
        <div key={n.id} data-testid={`notification-${n.id}`}>
          {n.type} - {n.read ? 'read' : 'unread'}
        </div>
      ))}
    </div>
  );
}

describe('NotificationContext', () => {
  it('initializes with empty notifications', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });

  it('adds notification correctly', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    const addBtn = screen.getByTestId('add-btn');
    addBtn.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    });
  });

  it('marks notification as read', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    const addBtn = screen.getByTestId('add-btn');
    addBtn.click();
    
    await waitFor(() => {
      expect(screen.getByText(/unread/)).toBeInTheDocument();
    });
    
    const markReadBtn = screen.getByTestId('mark-read-btn');
    markReadBtn.click();
    
    await waitFor(() => {
      expect(screen.getByText(/read/)).toBeInTheDocument();
    });
  });

  it('marks all notifications as read', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    const addBtn = screen.getByTestId('add-btn');
    addBtn.click();
    addBtn.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
    });
    
    const markAllBtn = screen.getByTestId('mark-all-btn');
    markAllBtn.click();
    
    await waitFor(() => {
      const notifications = screen.getAllByText(/read/);
      expect(notifications).toHaveLength(2);
    });
  });
});
