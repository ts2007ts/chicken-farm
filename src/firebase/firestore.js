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
  serverTimestamp,
  where
} from 'firebase/firestore'
import { db } from './config'

// Collection references
const COLLECTIONS = {
  INVESTORS: 'investors',
  TRANSACTIONS: 'transactions',
  EGGS: 'eggs',
  USERS: 'users',
  LOGS: 'logs',
  SETTINGS: 'settings',
  CHICKEN_INVENTORY: 'chicken_inventory',
  FEED_INVENTORY: 'feed_inventory',
  ARCHIVES: 'archives'
}

// ============ INVESTORS ============
export async function getInvestors() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.INVESTORS))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function addInvestor(investor, userEmail = 'System') {
  const docRef = await addDoc(collection(db, COLLECTIONS.INVESTORS), {
    ...investor,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  
  await addLog({
    type: 'add_investor',
    message: `Added new investor: ${investor.name}`,
    user: userEmail,
    details: investor
  })
  
  return docRef.id
}

export async function updateInvestor(investorId, data, userEmail = 'System') {
  const docRef = doc(db, COLLECTIONS.INVESTORS, String(investorId))
  const oldDoc = await getDoc(docRef)
  const oldData = oldDoc.exists() ? oldDoc.data() : {}
  
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
  
  await addLog({
    type: 'update_investor',
    message: `Updated investor: ${data.name || oldData.name}`,
    user: userEmail,
    details: { before: oldData, after: data }
  })
}

export async function deleteInvestor(investorId, userEmail = 'System') {
  const docRef = doc(db, COLLECTIONS.INVESTORS, String(investorId))
  const oldDoc = await getDoc(docRef)
  const oldData = oldDoc.exists() ? oldDoc.data() : {}
  
  await deleteDoc(docRef)
  
  await addLog({
    type: 'delete_investor',
    message: `Deleted investor: ${oldData.name}`,
    user: userEmail,
    details: oldData
  })
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

export async function addTransaction(transaction, userEmail = 'System') {
  const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
    ...transaction,
    createdAt: serverTimestamp()
  })
  
  await addLog({
    type: 'add_transaction',
    message: `Added ${transaction.type}: ${transaction.amount} L.S - ${transaction.note || ''}`,
    user: userEmail,
    details: transaction
  })
  
  return docRef.id
}

export async function updateTransaction(transactionId, data, userEmail = 'System') {
  if (!transactionId) throw new Error('Transaction ID is required')
  const docRef = doc(db, COLLECTIONS.TRANSACTIONS, String(transactionId))
  const oldDoc = await getDoc(docRef)
  const oldData = oldDoc.exists() ? oldDoc.data() : {}
  
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
  
  await addLog({
    type: 'update_transaction',
    message: `Updated transaction ${transactionId}`,
    user: userEmail,
    details: { before: oldData, after: data }
  })
}

export async function deleteTransaction(transactionId, userEmail = 'System') {
  if (!transactionId) throw new Error('Transaction ID is required')
  const docRef = doc(db, COLLECTIONS.TRANSACTIONS, String(transactionId))
  const oldDoc = await getDoc(docRef)
  const oldData = oldDoc.exists() ? oldDoc.data() : {}

  await deleteDoc(docRef)
  
  await addLog({
    type: 'delete_transaction',
    message: `Deleted transaction: ${oldData.amount} L.S - ${oldData.note || ''}`,
    user: userEmail,
    details: oldData
  })
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

export async function addEgg(egg, userEmail = 'System') {
  const docRef = await addDoc(collection(db, COLLECTIONS.EGGS), {
    ...egg,
    createdAt: serverTimestamp()
  })
  
  await addLog({
    type: 'add_egg',
    message: `Recorded egg production: ${egg.quantity} eggs`,
    user: userEmail,
    details: egg
  })
  
  return docRef.id
}

export async function deleteEgg(eggId, userEmail = 'System') {
  const docRef = doc(db, COLLECTIONS.EGGS, eggId)
  const oldDoc = await getDoc(docRef)
  const oldData = oldDoc.exists() ? oldDoc.data() : {}

  await deleteDoc(docRef)
  
  await addLog({
    type: 'delete_egg',
    message: `Deleted egg record: ${oldData.quantity} eggs from ${oldData.date}`,
    user: userEmail,
    details: oldData
  })
}

export async function updateEgg(eggId, data, userEmail = 'System') {
  const docRef = doc(db, COLLECTIONS.EGGS, eggId)
  const oldDoc = await getDoc(docRef)
  const oldData = oldDoc.exists() ? oldDoc.data() : {}

  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
  
  await addLog({
    type: 'update_egg',
    message: `Updated egg record from ${oldData.quantity} to ${data.quantity} eggs`,
    user: userEmail,
    details: { before: oldData, after: data }
  })
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

export async function updateUserProfile(uid, data, userEmail = 'System') {
  const docRef = doc(db, COLLECTIONS.USERS, uid)
  const oldDoc = await getDoc(docRef)
  const oldData = oldDoc.exists() ? oldDoc.data() : {}
  
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
  
  await addLog({
    type: 'update_user',
    message: `Updated user profile/role for: ${data.email || oldData.email}`,
    user: userEmail,
    details: { before: oldData, after: data }
  })
}

export async function deleteUser(uid, userEmail = 'System') {
  const docRef = doc(db, COLLECTIONS.USERS, uid)
  const oldDoc = await getDoc(docRef)
  const oldData = oldDoc.exists() ? oldDoc.data() : {}
  
  await deleteDoc(docRef)
  
  await addLog({
    type: 'delete_user',
    message: `Deleted user: ${oldData.email}`,
    user: userEmail,
    details: oldData
  })
}

export function subscribeToUsers(callback) {
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
    callback(users)
  })
}

// ============ ACTIVITY LOGS ============
export async function addLog(log) {
  try {
    await addDoc(collection(db, COLLECTIONS.LOGS), {
      ...log,
      timestamp: serverTimestamp()
    })
  } catch (error) {
    console.error("Error adding log:", error)
  }
}

export function subscribeToLogs(callback) {
  const q = query(collection(db, COLLECTIONS.LOGS), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(logs)
  })
}

// ============ SETTINGS ============
export async function getSettings() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.SETTINGS))
  const settings = {}
  snapshot.docs.forEach(doc => {
    settings[doc.id] = doc.data()
  })
  return settings
}

export async function updateSetting(id, data) {
  const docRef = doc(db, COLLECTIONS.SETTINGS, id)
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export function subscribeToSettings(callback) {
  return onSnapshot(collection(db, COLLECTIONS.SETTINGS), (snapshot) => {
    const settings = {}
    snapshot.docs.forEach(doc => {
      settings[doc.id] = doc.data()
    })
    callback(settings)
  })
}

// ============ CHICKEN INVENTORY ============
export async function addChickenRecord(record) {
  const docRef = await addDoc(collection(db, COLLECTIONS.CHICKEN_INVENTORY), {
    ...record,
    createdAt: serverTimestamp()
  })
  return docRef.id
}

export function subscribeToChickenInventory(callback) {
  const q = query(collection(db, COLLECTIONS.CHICKEN_INVENTORY), orderBy('date', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(records)
  })
}

export async function deleteChickenRecord(id) {
  await deleteDoc(doc(db, COLLECTIONS.CHICKEN_INVENTORY, id))
}

// ============ FEED INVENTORY ============
export async function addFeedRecord(record) {
  const docRef = await addDoc(collection(db, COLLECTIONS.FEED_INVENTORY), {
    ...record,
    createdAt: serverTimestamp()
  })
  return docRef.id
}

export function subscribeToFeedInventory(callback) {
  const q = query(collection(db, COLLECTIONS.FEED_INVENTORY), orderBy('date', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(records)
  })
}

export async function deleteFeedRecord(id) {
  await deleteDoc(doc(db, COLLECTIONS.FEED_INVENTORY, id))
}

// ============ ARCHIVES (Cycle Archiving) ============
export async function archiveCycle(archiveData) {
  const docRef = await addDoc(collection(db, COLLECTIONS.ARCHIVES), {
    ...archiveData,
    archivedAt: serverTimestamp()
  })
  
  // After archiving, clear current data
  await clearAllData()
  
  return docRef.id
}

export function subscribeToArchives(callback) {
  const q = query(collection(db, COLLECTIONS.ARCHIVES), orderBy('archivedAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const archives = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(archives)
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
