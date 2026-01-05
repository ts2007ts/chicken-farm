import { describe, it, expect, vi } from 'vitest';
import { addTransaction, getTransactions } from './firestore';
import { addDoc, collection, getDocs } from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

describe('Firestore Service', () => {
  it('adds a transaction correctly', async () => {
    const mockTransaction = { amount: 100, type: 'expense' };
    addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await addTransaction(mockTransaction);
    
    expect(addDoc).toHaveBeenCalled();
    expect(id).toBe('new-id');
  });

  it('fetches transactions correctly', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ amount: 100 }) },
      { id: '2', data: () => ({ amount: 200 }) }
    ];
    getDocs.mockResolvedValue({
      docs: mockDocs
    });

    const results = await getTransactions();
    expect(results).toHaveLength(2);
    expect(results[0].amount).toBe(100);
  });
});
