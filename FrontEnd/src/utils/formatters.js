import { BASE_CURRENCY, CURRENCY_OPTIONS, INR_TO_CURRENCY_RATE } from '../constants/currency'

export function getCurrencyCode() {
  if (typeof window === 'undefined') return BASE_CURRENCY
  const saved = localStorage.getItem('rp_currency') || BASE_CURRENCY
  return CURRENCY_OPTIONS.includes(saved) ? saved : BASE_CURRENCY
}

function convertFromInr(amountInInr, currencyCode) {
  const rate = INR_TO_CURRENCY_RATE[currencyCode] || 1
  return Number(amountInInr || 0) * rate
}

export function formatCurrency(amount, currencyCode = getCurrencyCode()) {
  const normalizedCurrency = CURRENCY_OPTIONS.includes(currencyCode) ? currencyCode : BASE_CURRENCY
  const converted = convertFromInr(amount, normalizedCurrency)
  const fractionDigits = normalizedCurrency === BASE_CURRENCY ? 0 : 2
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(converted)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}
