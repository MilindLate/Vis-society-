<script>
  // =============================================
  // CHOROPLETH MAP
  // Boston neighborhoods colored by a housing metric.
  // Click = select neighborhood (updates shared store).
  // Hover = tooltip with all stats.
  // Reacts to activeStep to switch the displayed metric.
  // =============================================
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  import { geoData, housingData, evictionData,
           selectedNeighborhood, activeStep, tooltip } from '../stores/index.js'
  import { latestByNeighborhood, latestEvictionRates } from '../utils/dataUtils.js'
  import { fmtDollar, fmtRate, fmtPct0 } from '../utils/format.js'

  // Which metric to color by, driven by the active scroll step
  const stepMetrics = ['median_rent', 'median_rent', 'rate', 'median_price', 'rate']
  $: metric = stepMetrics[$activeStep] ?? 'median_rent'

  // Merge geo features with latest housing/eviction data
  $: housingLatest   = latestByNeighborhood($housingData)
  $: evictionLatest  = latestEvictionRates($evictionData)
  $: dataByNeighborhood = buildLookup(housingLatest, evictionLatest)
  $: features = mergeGeo($geoData, dataByNeighborhood)
  $: colorScale = makeColorScale(features, metric)

  function buildLookup(housing, evictions) {
    const map = new Map()
    housing.forEach(d => map.set(d.neighborhood, { ...d }))
    evictions.forEach(d => {
      const existing = map.get(d.neighborhood) ?? {}
      map.set(d.neighborhood, { ...existing, evictions: d.evictions, rate: d.rate })
    })
    return map
  }

  function mergeGeo(geo, lookup) {
    if (!geo) return []
    return geo.features.map(f => ({
      ...f,
      data: lookup.get(f.properties.neighborhood) ?? {},
    }))
  }

  function makeColorScale(features, metric) {
    const vals = features.map(f => f.data[metric]).filter(v => v != null && !isNaN(v))
    if (!vals.length) return () => '#e0e0e0'
    const interp = metric === 'rate'
      ? d3.interpolateReds
      : d3.interpolateYlOrRd
    return d3.scaleSequential(interp).domain(d3.extent(vals))
  }

  // SVG dimensions — responsive via viewBox
  let svgEl
  const W = 560, H = 460
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }

  $: projection = $geoData
    ? d3.geoMercator().fitSize(
        [W - margin.left - margin.right, H - margin.top - margin.bottom],
        $geoData
      )
    : null

  $: pathGen = projection ? d3.geoPath(projection) : null

  // Hover handlers
  function handleMouseenter(event, feature) {
    const d = feature.data
    const rows = [
      { label: 'Median rent',  value: fmtDollar(d.median_rent) },
      { label: 'Median price', value: fmtDollar(d.median_price) },
      { label: 'Eviction rate', value: d.rate != null ? `${fmtRate(d.rate)}/1k` : 'N/A' },
      { label: '% renter',     value: fmtPct0(d.pct_renter) },
    ]
    tooltip.set({ visible: true, x: event.clientX, y: event.clientY,
                  title: feature.properties.neighborhood, rows })
  }

  function handleMousemove(event) {
    tooltip.update(t => ({ ...t, x: event.clientX, y: event.clientY }))
  }

  function handleMouseleave() {
    tooltip.update(t => ({ ...t, visible: false }))
  }

  function handleClick(feature) {
    const name = feature.properties.neighborhood
    selectedNeighborhood.update(cur => cur === name ? null : name)
  }

  // Legend
  $: legendStops = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    t,
    color: colorScale(
      colorScale.domain()[0] + t * (colorScale.domain()[1] - colorScale.domain()[0])
    ),
    label: metric === 'rate'
      ? fmtRate(colorScale.domain()[0] + t * (colorScale.domain()[1] - colorScale.domain()[0]))
      : fmtDollar(colorScale.domain()[0] + t * (colorScale.domain()[1] - colorScale.domain()[0])),
  }))

  $: metricLabel = {
    median_rent:  'Median Monthly Rent',
    median_price: 'Median Sale Price',
    rate:         'Eviction Rate (per 1,000 renters)',
  }[metric] ?? metric
</script>

<div class="map-wrap">
  <!-- Title bar -->
  <div class="map-header">
    <p class="map-title ui-text">{metricLabel}</p>
    {#if $selectedNeighborhood}
      <button
        class="clear-selection ui-text"
        onclick={() => selectedNeighborhood.set(null)}
        aria-label="Clear neighborhood selection"
      >
        Clear ✕
      </button>
    {/if}
  </div>

  <!-- SVG Map -->
  <svg
    bind:this={svgEl}
    viewBox="0 0 {W} {H}"
    role="img"
    aria-label="Map of Boston neighborhoods colored by {metricLabel}"
    class="map-svg"
  >
    <title>Boston neighborhoods — {metricLabel}</title>
    <g transform="translate({margin.left},{margin.top})">
      {#if pathGen}
        {#each features as feature (feature.properties.neighborhood)}
          {@const name  = feature.properties.neighborhood}
          {@const value = feature.data[metric]}
          {@const fill  = value != null ? colorScale(value) : '#ddd'}
          {@const isSelected = $selectedNeighborhood === name}
          {@const isDimmed   = $selectedNeighborhood && !isSelected}
          <path
            d={pathGen(feature)}
            fill={fill}
            fill-opacity={isDimmed ? 0.3 : 1}
            stroke={isSelected ? '#1a1a18' : '#fff'}
            stroke-width={isSelected ? 2.5 : 1}
            style="cursor: pointer; transition: fill-opacity 250ms ease, stroke-width 150ms ease;"
            role="button"
            tabindex="0"
            aria-label="{name}: {value != null ? (metric === 'rate' ? fmtRate(value) : fmtDollar(value)) : 'No data'}"
            aria-pressed={isSelected}
            onmouseenter={e => handleMouseenter(e, feature)}
            onmousemove={handleMousemove}
            onmouseleave={handleMouseleave}
            onclick={() => handleClick(feature)}
            onkeydown={e => e.key === 'Enter' && handleClick(feature)}
          />
        {/each}
      {/if}
    </g>

    <!-- Color legend -->
    <g class="legend" transform="translate({margin.left + 8}, {H - 50})">
      {#each legendStops as stop, i}
        <rect
          x={i * 36}
          y={0}
          width={36}
          height={10}
          fill={stop.color}
        />
      {/each}
      <text x={0}  y={22} class="legend-label">Low</text>
      <text x={4 * 36} y={22} class="legend-label" text-anchor="end">High</text>
    </g>
  </svg>
</div>

<style>
  .map-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .map-title {
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .clear-selection {
    font-size: var(--text-xs);
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 100px;
    padding: 2px 10px;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: all var(--transition-fast);
  }

  .clear-selection:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
  }

  .map-svg {
    flex: 1;
    width: 100%;
    height: auto;
  }

  .legend-label {
    font-family: var(--font-ui);
    font-size: 10px;
    fill: var(--color-text-muted);
  }
</style>
