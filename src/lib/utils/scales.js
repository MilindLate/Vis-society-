// =============================================
// D3 SCALE HELPERS
// Reusable scale factories used across charts
// =============================================
import * as d3 from 'd3'

// Color scale for choropleth map (rent/price)
// Domain will be set dynamically based on data range
export function makeSequentialColor(domain) {
  return d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateYlOrRd)
}

// Color scale for eviction rate
export function makeEvictionColor(domain) {
  return d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateReds)
}

// Time scale for x-axis of line chart
export function makeTimeScale(years, width) {
  return d3.scaleLinear()
    .domain(d3.extent(years))
    .range([0, width])
}

// Linear y scale for charts
export function makeLinearY(domain, height) {
  return d3.scaleLinear()
    .domain([0, domain[1] * 1.05]) // 5% padding at top
    .range([height, 0])
    .nice()
}

// Band scale for bar chart x-axis
export function makeBandX(categories, width) {
  return d3.scaleBand()
    .domain(categories)
    .range([0, width])
    .padding(0.25)
}

// Format helpers
export const formatDollar   = d3.format('$,.0f')
export const formatPercent  = d3.format('.1%')
export const formatComma    = d3.format(',')
export const formatShort    = (v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`
