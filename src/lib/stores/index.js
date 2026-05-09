// =============================================
// SHARED SVELTE STORES
// All components read/write these to stay in sync
// =============================================
import { writable, derived } from 'svelte/store'

// Which scroll step is currently active (0-indexed)
export const activeStep = writable(0)

// Which neighborhood is selected (null = all of Boston)
// Set by clicking the map; bar chart + line chart react to this
export const selectedNeighborhood = writable(null)

// Which year is currently highlighted (for time-series animations)
export const selectedYear = writable(2023)

// Tooltip state - driven by any chart on mouseover
export const tooltip = writable({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  rows: [],   // [{ label, value }]
})

// All loaded datasets live here
export const housingData    = writable([])
export const evictionData   = writable([])
export const geoData        = writable(null)
export const dataLoaded     = writable(false)

// Derived: filtered housing data based on selected neighborhood
export const filteredHousing = derived(
  [housingData, selectedNeighborhood],
  ([$housingData, $selectedNeighborhood]) => {
    if (!$selectedNeighborhood) return $housingData
    return $housingData.filter(d => d.neighborhood === $selectedNeighborhood)
  }
)
