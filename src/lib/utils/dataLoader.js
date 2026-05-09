// =============================================
// DATA LOADER UTILITY
// Call loadAll() once in App.svelte on mount.
// All data is stored in Svelte stores so any
// component can access it reactively.
// =============================================
import { csv, json } from 'd3'
import {
  housingData,
  evictionData,
  geoData,
  dataLoaded,
} from '../stores/index.js'

// Helper: parse numbers from CSV strings
function parseHousing(d) {
  return {
    neighborhood: d.neighborhood,
    year:         +d.year,
    median_rent:  +d.median_rent,
    median_price: +d.median_price,
    units:        +d.units,
    pct_renter:   +d.pct_renter,
  }
}

function parseEviction(d) {
  return {
    neighborhood: d.neighborhood,
    year:         +d.year,
    evictions:    +d.evictions,
    rate:         +d.rate,
  }
}

export async function loadAll() {
  try {
    // Load all datasets in parallel
    const [housing, evictions, geo] = await Promise.all([
      csv('/data/housing.csv',   parseHousing),
      csv('/data/evictions.csv', parseEviction),
      json('/data/geo_boston.json'),
    ])

    housingData.set(housing)
    evictionData.set(evictions)
    geoData.set(geo)
    dataLoaded.set(true)

    console.log(`Loaded: ${housing.length} housing rows, ${evictions.length} eviction rows`)
  } catch (err) {
    console.error('Data loading failed:', err)
    // Set empty arrays so app doesn't crash — show "no data" states
    housingData.set([])
    evictionData.set([])
    dataLoaded.set(true)
  }
}
