// =============================================
// DATA LOADER  (Phase 2 — full version)
// Loads all datasets in parallel, parses types,
// writes into Svelte stores.
// =============================================
import { csv, json } from 'd3'
import {
  housingData,
  evictionData,
  geoData,
  dataLoaded,
} from '../stores/index.js'

function parseHousing(d) {
  return {
    neighborhood: d.neighborhood.trim(),
    year:         +d.year,
    median_rent:  +d.median_rent,
    median_price: +d.median_price,
    units:        +d.units,
    pct_renter:   +d.pct_renter,
  }
}

function parseEviction(d) {
  return {
    neighborhood: d.neighborhood.trim(),
    year:         +d.year,
    evictions:    +d.evictions,
    rate:         +d.rate,
  }
}

function makeFallbackGeo() {
  const neighborhoods = [
    { name: 'Allston',       lat: 42.353, lng: -71.131 },
    { name: 'Back Bay',      lat: 42.350, lng: -71.081 },
    { name: 'East Boston',   lat: 42.380, lng: -71.033 },
    { name: 'Roxbury',       lat: 42.325, lng: -71.087 },
    { name: 'South End',     lat: 42.341, lng: -71.072 },
    { name: 'Dorchester',    lat: 42.302, lng: -71.062 },
    { name: 'Jamaica Plain', lat: 42.310, lng: -71.115 },
    { name: 'South Boston',  lat: 42.337, lng: -71.046 },
  ]
  return {
    type: 'FeatureCollection',
    features: neighborhoods.map(n => ({
      type: 'Feature',
      properties: { neighborhood: n.name },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [n.lng - 0.02, n.lat - 0.012],
          [n.lng + 0.02, n.lat - 0.012],
          [n.lng + 0.02, n.lat + 0.012],
          [n.lng - 0.02, n.lat + 0.012],
          [n.lng - 0.02, n.lat - 0.012],
        ]],
      },
    })),
  }
}

export async function loadAll() {
  const base = import.meta.env.BASE_URL
  try {
    const [housing, evictions] = await Promise.all([
      csv(`${base}data/housing.csv`,   parseHousing),
      csv(`${base}data/evictions.csv`, parseEviction),
    ])

    let geo
    try {
      geo = await json(`${base}data/geo_boston.json`)
    } catch {
      console.warn('[DataLoader] geo_boston.json not found — using fallback geometry')
      geo = makeFallbackGeo()
    }

    const cleanHousing   = housing.filter(d => !isNaN(d.median_rent) && !isNaN(d.median_price))
    const cleanEvictions = evictions.filter(d => !isNaN(d.evictions) && !isNaN(d.rate))

    housingData.set(cleanHousing)
    evictionData.set(cleanEvictions)
    geoData.set(geo)
    dataLoaded.set(true)

    console.log(`[DataLoader] housing=${cleanHousing.length} rows, evictions=${cleanEvictions.length} rows, geo=${geo.features.length} features`)
  } catch (err) {
    console.error('[DataLoader] Fatal error:', err)
    housingData.set([])
    evictionData.set([])
    geoData.set(makeFallbackGeo())
    dataLoaded.set(true)
  }
}
