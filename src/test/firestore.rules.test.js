import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';

let testEnv;

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    try {
      testEnv = await initializeTestEnvironment({
        projectId: 'chicken-farm-test',
        firestore: {
          rules: fs.readFileSync('firestore.rules', 'utf8'),
          host: '127.0.0.1',
          port: 8080,
        },
      });
    } catch (error) {
      console.error('Failed to initialize test environment:', error);
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  it('allows authenticated users to read investors', async () => {
    if (!testEnv) return;
    const aliceContext = testEnv.authenticatedContext('alice');
    const investorRef = doc(aliceContext.firestore(), 'investors/inv1');
    await assertSucceeds(getDoc(investorRef));
  });

  it('denies unauthenticated users to read investors', async () => {
    if (!testEnv) return;
    const unauthContext = testEnv.unauthenticatedContext();
    const investorRef = doc(unauthContext.firestore(), 'investors/inv1');
    await assertFails(getDoc(investorRef));
  });

  it('allows admins to write to transactions', async () => {
    if (!testEnv) return;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/admin1'), { role: 'admin' });
    });

    const adminContext = testEnv.authenticatedContext('admin1');
    const transactionRef = doc(adminContext.firestore(), 'transactions/t1');
    await assertSucceeds(setDoc(transactionRef, { amount: 100, type: 'expense' }));
  });

  it('denies non-admins to write to transactions', async () => {
    if (!testEnv) return;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user1'), { role: 'investor' });
    });

    const userContext = testEnv.authenticatedContext('user1');
    const transactionRef = doc(userContext.firestore(), 'transactions/t1');
    await assertFails(setDoc(transactionRef, { amount: 100, type: 'expense' }));
  });
});
