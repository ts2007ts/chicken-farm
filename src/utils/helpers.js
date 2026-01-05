import { ar } from '../translations/ar';
import { en } from '../translations/en';

export const formatDate = (dateString, language = 'ar') => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  
  if (language === 'ar') {
    const months = [
      'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
      'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
    ]
    const month = months[date.getMonth()]
    return `\u200E${day}/${month}/${year}`
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    return `${day} ${month} ${year}`
  }
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
