export const formatCurrency = (amount: number, locale = 'vi-VN'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(amount)

export const formatCompact = (amount: number): string =>
  amount >= 1_000_000
    ? `${(amount / 1_000_000).toFixed(1)}tr`
    : `${(amount / 1_000).toFixed(0)}k`
