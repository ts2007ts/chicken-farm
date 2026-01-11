import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { addLog } from '../firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

// Initial bootstrap email for first super admin
const INITIAL_SUPER_ADMIN_EMAIL = import.meta.env.VITE_INITIAL_SUPER_ADMIN_EMAIL;

// Map emails to investors - أضف إيميل كل مستثمر هنا
const EMAIL_TO_INVESTOR = {
  'tarekyaghi757@gmail.com': { investorId: 4, investorName: 'طارق', role: 'super_admin' },
  'sara91abboud@gmail.com': { investorId: 5, investorName: 'سارا', role: 'admin' },
  // أضف إيميلات المستثمرين الآخرين هنا:
  'loay@chicken-farm.com': { investorId: 1, investorName: 'لؤي', role: 'investor' },
  'malek@chicken-farm.com': { investorId: 2, investorName: 'مالك', role: 'investor' },
  'wedad@chicken-farm.com': { investorId: 3, investorName: 'وداد', role: 'investor' },
  'alia@chicken-farm.com': { investorId: 6, investorName: 'عليا', role: 'investor' },
}

if (INITIAL_SUPER_ADMIN_EMAIL) {
  EMAIL_TO_INVESTOR[INITIAL_SUPER_ADMIN_EMAIL] = { investorId: null, investorName: 'Super Admin', role: 'super_admin' };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Login with email and password
  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    // Log login activity
    await addLog({
      type: 'login',
      message: `User logged in: ${email}`,
      user: email,
      uid: result.user.uid
    })
    return result
  }

  // Send email link for passwordless login
  async function sendLoginLink(email) {
    const actionCodeSettings = {
      url: window.location.origin + '/login',
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    window.localStorage.setItem('emailForSignIn', email)
  }

  // Complete email link sign in
  async function completeEmailLinkSignIn() {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn')
      if (!email) {
        email = window.prompt('الرجاء إدخال بريدك الإلكتروني للتأكيد')
      }
      const result = await signInWithEmailLink(auth, email, window.location.href)
      window.localStorage.removeItem('emailForSignIn')
      return result
    }
    return null
  }

  // Logout
  async function logout() {
    const email = currentUser?.email
    const uid = currentUser?.uid
    await signOut(auth)
    setUserProfile(null)
    // Log logout activity
    if (email) {
      await addLog({
        type: 'logout',
        message: `User logged out: ${email}`,
        user: email,
        uid: uid
      })
    }
  }

  // Get user profile from Firestore
  async function getUserProfile(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  }

  // Create or update user profile
  async function updateUserProfile(uid, data) {
    await setDoc(doc(db, 'users', uid), data, { merge: true })
    setUserProfile(prev => ({ ...prev, ...data }))
  }

  // Check if user is super admin
  function isSuperAdmin() {
    return userProfile?.role === 'super_admin'
  }

  // Check if user is admin
  function isAdmin() {
    return userProfile?.role === 'admin' || isSuperAdmin()
  }

  // Check if user can edit specific investor data
  function canEditInvestor(investorId) {
    if (isAdmin()) return true
    return userProfile?.investorId === investorId
  }

  // Check if user can edit general data (expenses, eggs, etc.)
  function canEditGeneral() {
    return isAdmin()
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      
      if (user) {
        try {
          // Try to get existing profile
          let profile = await getUserProfile(user.uid)
          
          if (!profile) {
            // Create profile from EMAIL_TO_INVESTOR mapping
            const investorInfo = EMAIL_TO_INVESTOR[user.email] || { investorId: null, investorName: null, role: 'investor' }
            profile = {
              email: user.email,
              role: investorInfo.role,
              investorId: investorInfo.investorId,
              investorName: investorInfo.investorName,
              createdAt: new Date().toISOString()
            }
            await setDoc(doc(db, 'users', user.uid), profile)
          } else {
            // Update role if it changed in EMAIL_TO_INVESTOR
            const investorInfo = EMAIL_TO_INVESTOR[user.email];
            if (investorInfo && investorInfo.role !== profile.role) {
              profile.role = investorInfo.role;
              await setDoc(doc(db, 'users', user.uid), { role: investorInfo.role }, { merge: true });
            }
          }
          
          setUserProfile(profile)
        } catch (error) {
          console.error('Error loading user profile:', error)
          // Set a default profile even if Firestore fails
          const investorInfo = EMAIL_TO_INVESTOR[user.email] || { investorId: null, investorName: null, role: 'investor' }
          setUserProfile({
            email: user.email,
            role: investorInfo.role,
            investorId: investorInfo.investorId,
            investorName: investorInfo.investorName
          })
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    logout,
    sendLoginLink,
    completeEmailLinkSignIn,
    updateUserProfile,
    isAdmin,
    isSuperAdmin,
    canEditInvestor,
    canEditGeneral
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
