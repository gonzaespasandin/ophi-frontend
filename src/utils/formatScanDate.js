const timeFormatter = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function padded(value) {
  return String(value).padStart(2, '0')
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function calendarDaysAgo(date, now) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  return Math.round((startOfDay(now) - startOfDay(date)) / millisecondsPerDay)
}

/**
 * Formats a scan timestamp: "Hoy · 14:32", "Ayer · 19:07", "12/08 · 09:15"
 * for anything older, and "12/08/2025 · 09:15" once the year differs — the full
 * history spans years, where a bare day and month would be ambiguous.
 */
export function formatScanDate(value, now = new Date()) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const time = timeFormatter.format(date)
  const daysAgo = calendarDaysAgo(date, now)

  if (daysAgo === 0) return `Hoy · ${time}`
  if (daysAgo === 1) return `Ayer · ${time}`

  const day = `${padded(date.getDate())}/${padded(date.getMonth() + 1)}`
  const isAnotherYear = date.getFullYear() !== now.getFullYear()

  return isAnotherYear
    ? `${day}/${date.getFullYear()} · ${time}`
    : `${day} · ${time}`
}
