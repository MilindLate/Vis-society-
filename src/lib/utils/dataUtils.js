// =============================================
// DATA UTILITIES
// Pure functions for transforming housing data.
// No D3 DOM manipulation — just math & arrays.
// =============================================
import * as d3 from 'd3'

// ── Aggregation ──────────────────────────────

/**
 * Roll up housing rows to one object per neighborhood
 * using the most recent year available.
 * Returns array sorted by median_rent descending.
 */
export function latestByNeighborhood(data) {
  const rolled = d3.rollup(
    data,
    rows => {
      const latest = rows.reduce((a, b) => a.year > b.year ? a : b)
      return latest
    },
    d => d.neighborhood
  )
  return Array.from(rolled.values())
    .sort((a, b) => b.median_rent - a.median_rent)
}

/**
 * Compute rent growth % between earliest and latest year
 * for each neighborhood.
 * Returns array: [{ neighborhood, growth, from, to }]
 */
export function rentGrowthByNeighborhood(data) {
  const rolled = d3.rollup(
    data,
    rows => {
      const sorted = rows.sort((a, b) => a.year - b.year)
      const first  = sorted[0]
      const last   = sorted[sorted.length - 1]
      return {
        neighborhood: first.neighborhood,
        growth: (last.median_rent - first.median_rent) / first.median_rent,
        from:   first.median_rent,
        to:     last.median_rent,
        fromYear: first.year,
        toYear:   last.year,
      }
    },
    d => d.neighborhood
  )
  return Array.from(rolled.values())
    .sort((a, b) => b.growth - a.growth)
}

/**
 * Get time series for a single neighborhood (or all if null).
 * Returns array sorted by year.
 */
export function timeSeriesFor(data, neighborhood = null) {
  const filtered = neighborhood
    ? data.filter(d => d.neighborhood === neighborhood)
    : data
  // If all neighborhoods: average by year
  if (!neighborhood) {
    const byYear = d3.rollup(
      filtered,
      rows => ({
        year:         rows[0].year,
        median_rent:  d3.mean(rows, r => r.median_rent),
        median_price: d3.mean(rows, r => r.median_price),
        pct_renter:   d3.mean(rows, r => r.pct_renter),
      }),
      d => d.year
    )
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year)
  }
  return filtered.sort((a, b) => a.year - b.year)
}

/**
 * Get all neighborhoods' time series as an array of series objects.
 * Useful for multi-line charts.
 * Returns [{ neighborhood, values: [{year, median_rent, ...}] }]
 */
export function allNeighborhoodSeries(data) {
  const rolled = d3.rollup(
    data,
    rows => rows.sort((a, b) => a.year - b.year),
    d => d.neighborhood
  )
  return Array.from(rolled, ([neighborhood, values]) => ({
    neighborhood,
    values,
  }))
}

// ── Eviction helpers ─────────────────────────

/**
 * Latest eviction rate per neighborhood (most recent year).
 * Returns array sorted by rate descending.
 */
export function latestEvictionRates(evictions) {
  const rolled = d3.rollup(
    evictions,
    rows => rows.reduce((a, b) => a.year > b.year ? a : b),
    d => d.neighborhood
  )
  return Array.from(rolled.values())
    .sort((a, b) => b.rate - a.rate)
}

/**
 * Eviction time series for a neighborhood (or city average).
 */
export function evictionSeriesFor(evictions, neighborhood = null) {
  const filtered = neighborhood
    ? evictions.filter(d => d.neighborhood === neighborhood)
    : evictions
  if (!neighborhood) {
    const byYear = d3.rollup(
      filtered,
      rows => ({
        year:      rows[0].year,
        evictions: d3.sum(rows, r => r.evictions),
        rate:      d3.mean(rows, r => r.rate),
      }),
      d => d.year
    )
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year)
  }
  return filtered.sort((a, b) => a.year - b.year)
}

// ── Stats helpers ────────────────────────────

/**
 * Returns { min, max, mean, median, q1, q3 } for a numeric field.
 */
export function summarize(data, field) {
  const values = data.map(d => d[field]).filter(v => !isNaN(v)).sort(d3.ascending)
  return {
    min:    d3.min(values),
    max:    d3.max(values),
    mean:   d3.mean(values),
    median: d3.median(values),
    q1:     d3.quantile(values, 0.25),
    q3:     d3.quantile(values, 0.75),
  }
}

/**
 * Normalize values to 0–1 range (for comparing different metrics).
 */
export function normalize(data, field) {
  const ext = d3.extent(data, d => d[field])
  return data.map(d => ({
    ...d,
    [`${field}_norm`]: (d[field] - ext[0]) / (ext[1] - ext[0]),
  }))
}
