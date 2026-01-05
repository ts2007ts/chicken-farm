import { useState, useEffect } from 'react'
import { INITIAL_INVESTORS } from '../constants'
import {
  subscribeToInvestors,
  subscribeToTransactions,
  subscribeToEggs,
  initializeInvestors,
  subscribeToSettings,
  subscribeToChickenInventory,
  subscribeToFeedInventory,
  subscribeToArchives
} from '../firebase/firestore'

export function useAppData(currentUser) {
  const [investors, setInvestors] = useState(INITIAL_INVESTORS)
  const [transactions, setTransactions] = useState([])
  const [eggs, setEggs] = useState([])
  const [settings, setSettings] = useState({})
  const [chickenInventory, setChickenInventory] = useState([])
  const [feedInventory, setFeedInventory] = useState([])
  const [archives, setArchives] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    // Initialize investors in Firestore ONLY if they don't exist and we have initial data (now empty)
    if (INITIAL_INVESTORS.length > 0) {
      initializeInvestors(INITIAL_INVESTORS)
    }

    // Subscribe to real-time updates
    const unsubInvestors = subscribeToInvestors((data) => {
      // Merge gender from INITIAL_INVESTORS
      const merged = data.map(inv => {
        const initialInv = INITIAL_INVESTORS.find(i => i.id === inv.id)
        return { ...inv, gender: initialInv?.gender || 'male' }
      })
      setInvestors(merged.length > 0 ? merged : INITIAL_INVESTORS)
    })

    const unsubTransactions = subscribeToTransactions((data) => {
      setTransactions(data)
    })

    const unsubEggs = subscribeToEggs((data) => {
      setEggs(data)
    })

    const unsubSettings = subscribeToSettings((data) => {
      setSettings(data)
    })

    const unsubChicken = subscribeToChickenInventory((data) => {
      setChickenInventory(data)
    })

    const unsubFeed = subscribeToFeedInventory((data) => {
      setFeedInventory(data)
    })

    const unsubArchives = subscribeToArchives((data) => {
      setArchives(data)
    })

    setLoading(false)

    return () => {
      unsubInvestors()
      unsubTransactions()
      unsubEggs()
      unsubSettings()
      unsubChicken()
      unsubFeed()
      unsubArchives()
    }
  }, [currentUser])

  return { investors, transactions, eggs, settings, chickenInventory, feedInventory, archives, loading }
}
