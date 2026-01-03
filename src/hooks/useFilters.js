import { useState } from 'react'

export function useFilters(transactions) {
  const [filterDate, setFilterDate] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAmount, setFilterAmount] = useState('')
  const [filterNotes, setFilterNotes] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 10

  const filteredTransactions = transactions.filter(t => {
    const dateMatch = filterDate === '' || new Date(t.date).toISOString().split('T')[0] === new Date(filterDate).toISOString().split('T')[0]
    const categoryMatch = filterCategory === 'all' || t.type === filterCategory || (t.type === 'expense' && t.category === filterCategory)
    const amountMatch = filterAmount === '' || t.amount.toString().includes(filterAmount)
    const notesMatch = filterNotes === '' || (t.note && t.note.includes(filterNotes)) || (t.investorName && t.investorName.includes(filterNotes))
    
    return dateMatch && categoryMatch && amountMatch && notesMatch
  })

  return {
    filterDate, setFilterDate,
    filterCategory, setFilterCategory,
    filterAmount, setFilterAmount,
    filterNotes, setFilterNotes,
    currentPage, setCurrentPage,
    transactionsPerPage,
    filteredTransactions
  }
}
