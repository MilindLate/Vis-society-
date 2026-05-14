// =============================================
// FORMAT HELPERS
// All number/date formatting in one place.
// Import what you need in components.
// =============================================
import * as d3 from 'd3'

// Currency
export const fmtDollar    = d3.format('$,.0f')         // $1,400
export const fmtDollarK   = v => `$${d3.format('.0f')(v / 1000)}k`  // $1.4k
export const fmtDollarM   = v => `$${d3.format('.2f')(v / 1000000)}M` // $1.25M

// Numbers
export const fmtComma     = d3.format(',')             // 10,200
export const fmtPercent   = d3.format('.1%')           // 72.3%
export const fmtPct0      = d3.format('.0%')           // 72%
export const fmtGrowth    = v => v >= 0
  ? `+${d3.format('.0%')(v)}`
  : d3.format('.0%')(v)                                // +45% or -12%

// Compact axis labels
export function fmtAxis(value) {
  if (value >= 1_000_000) return `$${value / 1_000_000}M`
  if (value >= 1_000)     return `$${value / 1_000}k`
  return `$${value}`
}

// Rate (evictions per 1000 renters)
export const fmtRate = d3.format('.1f')                // 4.5

// Year
export const fmtYear = v => String(v)

// Truncate long neighborhood names for axis labels
export function truncate(str, maxLen = 14) {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str
}
