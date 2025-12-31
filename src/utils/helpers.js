export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  // Add Unicode LRM (Left-to-Right Mark) to ensure correct order in RTL layouts
  return `\u200E${day}/${month}/${year}`
}

export const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

export const parseDateInput = (dateStr) => {
  if (!dateStr) return new Date().toISOString()
  return new Date(dateStr).toISOString()
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const formatBalance = (value, round = false) => {
  let num = parseFloat(value)
  if (round) {
    num = Math.round(num / 1000) * 1000
  }
  if (num < 0) {
    return { text: `(${formatNumber(Math.abs(num))})`, isNegative: true }
  }
  return { text: formatNumber(num), isNegative: false }
}
