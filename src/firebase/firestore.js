import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './config'

// Collection references
const COLLECTIONS = {
  INVESTORS: 'investors',
  TRANSACTIONS: 'transactions',
  EGGS: 'eggs',
  USERS: 'users'
}

// ============ INVESTORS ============
export async function getInvestors() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.INVESTORS))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function updateInvestor(investorId, data) {
  const docRef = doc(db, COLLECTIONS.INVESTORS, String(investorId))
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function initializeInvestors(investors) {
  for (const investor of investors) {
    const docRef = doc(db, COLLECTIONS.INVESTORS, String(investor.id))
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      await setDoc(docRef, { ...investor, createdAt: serverTimestamp() })
    }
  }
}

export function subscribeToInvestors(callback) {
  return onSnapshot(collection(db, COLLECTIONS.INVESTORS), (snapshot) => {
    const investors = snapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    }))
    callback(investors.sort((a, b) => a.id - b.id))
  })
}

// ============ TRANSACTIONS ============
export async function getTransactions() {
  const q = query(collection(db, COLLECTIONS.TRANSACTIONS), orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function addTransaction(transaction) {
  const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
    ...transaction,
    createdAt: serverTimestamp()
  })
  return docRef.id
}

export async function updateTransaction(transactionId, data) {
  if (!transactionId) throw new Error('Transaction ID is required')
  const docRef = doc(db, COLLECTIONS.TRANSACTIONS, String(transactionId))
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
}

export async function deleteTransaction(transactionId) {
  if (!transactionId) throw new Error('Transaction ID is required')
  await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, String(transactionId)))
}

export function subscribeToTransactions(callback) {
  const q = query(collection(db, COLLECTIONS.TRANSACTIONS), orderBy('date', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(transactions)
  })
}

// ============ EGGS ============
export async function getEggs() {
  const q = query(collection(db, COLLECTIONS.EGGS), orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function addEgg(egg) {
  const docRef = await addDoc(collection(db, COLLECTIONS.EGGS), {
    ...egg,
    createdAt: serverTimestamp()
  })
  return docRef.id
}

export async function deleteEgg(eggId) {
  await deleteDoc(doc(db, COLLECTIONS.EGGS, eggId))
}

export async function updateEgg(eggId, data) {
  const docRef = doc(db, COLLECTIONS.EGGS, eggId)
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
}

export async function getUserProfile(uid) {
  const docRef = doc(db, COLLECTIONS.USERS, uid)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? docSnap.data() : null
}

export function subscribeToEggs(callback) {
  const q = query(collection(db, COLLECTIONS.EGGS), orderBy('date', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const eggs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(eggs)
  })
}

// ============ USERS ============
export async function getUserByEmail(email) {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS))
  const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
  return users.find(u => u.email === email)
}

export async function updateUserRole(uid, investorName, investorId, role = 'investor') {
  const docRef = doc(db, COLLECTIONS.USERS, uid)
  await updateDoc(docRef, { 
    investorName, 
    investorId, 
    role,
    updatedAt: serverTimestamp() 
  })
}

export function subscribeToUsers(callback) {
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
    callback(users)
  })
}

// ============ BULK IMPORT/EXPORT ============
export async function importAllData(data) {
  const results = { investors: 0, transactions: 0, eggs: 0, users: 0 }
  
  // Import investors
  if (data.investors && Array.isArray(data.investors)) {
    for (const investor of data.investors) {
      const docRef = doc(db, COLLECTIONS.INVESTORS, String(investor.id))
      await setDoc(docRef, {
        ...investor,
        id: investor.id,
        updatedAt: serverTimestamp()
      })
      results.investors++
    }
  }

  // Import users (emails and roles)
  if (data.users && Array.isArray(data.users)) {
    for (const user of data.users) {
      const { uid, ...userData } = user
      if (uid) {
        const docRef = doc(db, COLLECTIONS.USERS, uid)
        await setDoc(docRef, {
          ...userData,
          updatedAt: serverTimestamp()
        }, { merge: true })
        results.users++
      }
    }
  }
  
  // Import transactions
  if (data.transactions && Array.isArray(data.transactions)) {
    for (const transaction of data.transactions) {
      // Use the original ID as document ID to avoid duplicates
      const docRef = doc(db, COLLECTIONS.TRANSACTIONS, String(transaction.id))
      await setDoc(docRef, {
        ...transaction,
        importedAt: serverTimestamp()
      })
      results.transactions++
    }
  }
  
  // Import eggs
  if (data.eggs && Array.isArray(data.eggs)) {
    for (const egg of data.eggs) {
      const docRef = doc(db, COLLECTIONS.EGGS, String(egg.id))
      await setDoc(docRef, {
        ...egg,
        importedAt: serverTimestamp()
      })
      results.eggs++
    }
  }
  
  return results
}

export async function exportAllData() {
  const investors = await getInvestors()
  const transactions = await getTransactions()
  const eggs = await getEggs()
  const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS))
  const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
  
  return {
    investors: investors.map(inv => {
      const { createdAt, updatedAt, ...rest } = inv
      return rest
    }),
    users: users.map(u => {
      const { createdAt, updatedAt, ...rest } = u
      return rest
    }),
    transactions: transactions.map(t => {
      const { createdAt, updatedAt, importedAt, ...rest } = t
      return rest
    }),
    eggs: eggs.map(e => {
      const { createdAt, updatedAt, importedAt, ...rest } = e
      return rest
    }),
    exportDate: new Date().toISOString(),
    version: '1.1'
  }
}

export async function clearAllData() {
  // Clear transactions
  const transactionsSnapshot = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS))
  for (const docSnap of transactionsSnapshot.docs) {
    await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, docSnap.id))
  }
  
  // Clear eggs
  const eggsSnapshot = await getDocs(collection(db, COLLECTIONS.EGGS))
  for (const docSnap of eggsSnapshot.docs) {
    await deleteDoc(doc(db, COLLECTIONS.EGGS, docSnap.id))
  }
  
  // Reset investors to zero capital
  const investorsSnapshot = await getDocs(collection(db, COLLECTIONS.INVESTORS))
  for (const docSnap of investorsSnapshot.docs) {
    await updateDoc(doc(db, COLLECTIONS.INVESTORS, docSnap.id), {
      initialCapital: 0,
      currentCapital: 0,
      updatedAt: serverTimestamp()
    })
  }
}
