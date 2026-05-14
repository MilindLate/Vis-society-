<script>
  // =============================================
  // BAR CHART
  // Compares neighborhoods on a metric.
  // Sortable (value / alphabetical).
  // Bars animate height on mount and step change.
  // Linked to map: selected neighborhood highlighted.
  // =============================================
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  import { housingData, evictionData,
           selectedNeighborhood, activeStep, tooltip } from '../stores/index.js'
  import { latestByNeighborhood, latestEvictionRates } from '../utils/dataUtils.js'
  import { fmtDollar, fmtRate, fmtGrowth, fmtPct0, truncate } from '../utils/format.js'
  import { rentGrowthByNeighborhood } from '../utils/dataUtils.js'

  // Which metric per scroll step
  const stepMetrics = ['median_rent', 'growth', 'rate', 'median_price', 'rate']
  $: metric = stepMetrics[$activeStep] ?? 'median_rent'

  $: metricLabel = {
    median_rent:  'Median Monthly Rent (2023)',
    median_price: 'Median Sale Price (2023)',
    rate:         'Eviction Rate per 1,000 Renters',
    growth:       'Rent Growth 2013–2023',
  }[metric] ?? metric

  // Build data for each metric
  $: housingLatest  = latestByNeighborhood($housingData)
  $: evictionLatest = latestEvictionRates($evictionData)
  $: growthData     = rentGrowthByNeighborhood($housingData)

  $: rawData = (() => {
    if (metric === 'rate')   return evictionLatest.map(d => ({ neighborhood: d.neighborhood, value: d.rate }))
    if (metric === 'growth') return growthData.map(d => ({ neighborhood: d.neighborhood, value: d.growth }))
    return housingLatest.map(d => ({ neighborhood: d.neighborhood, value: d[metric] }))
  })()

  // Sort toggle
  let sortBy = 'value' // 'value' | 'alpha'
  $: sortedData = [...rawData].sort((a, b) =>
    sortBy === 'value'
      ? b.value - a.value
      : a.neighborhood.localeCompare(b.neighborhood)
  )

  // Dimensions
  const W = 560, H = 360
  const margin = { top: 24, right: 24, bottom: 80, left: 52 }
  const innerW = W - margin.left - margin.right
  const innerH = H - margin.top  - margin.bottom

  // Scales
  $: xScale = d3.scaleBand()
    .domain(sortedData.map(d => d.neighborhood))
    .range([0, innerW])
    .padding(0.28)

  $: maxVal = d3.max(sortedData, d => Math.abs(d.value)) ?? 1
  $: yScale = d3.scaleLinear()
    .domain([0, maxVal * 1.1])
    .range([innerH, 0])
    .nice()

  $: yTicks = yScale.ticks(5)

  // Color: highlight selected, use primary for all
  function barFill(d) {
    if ($selectedNeighborhood === d.neighborhood) return 'var(--color-primary)'
    if ($selectedNeighborhood) return 'var(--color-border)'
    return metric === 'rate' ? '#c0392b' : '#2d6a4f'
  }

  // Format value for tooltip / label
  function fmtValue(v) {
    if (metric === 'growth') return fmtGrowth(v)
    if (metric === 'rate')   return `${fmtRate(v)}/1k`
    return fmtDollar(v)
  }

  // Tooltip
  function handleMouseenter(event, d) {
    tooltip.set({
      visible: true, x: event.clientX, y: event.clientY,
      title: d.neighborhood,
      rows: [{ label: metricLabel, value: fmtValue(d.value) }],
    })
  }
  function handleMousemove(e) {
    tooltip.update(t => ({ ...t, x: e.clientX, y: e.clientY }))
  }
  function handleMouseleave() {
    tooltip.update(t => ({ ...t, visible: false }))
  }
  function handleClick(d) {
    selectedNeighborhood.update(cur =>
      cur === d.neighborhood ? null : d.neighborhood
    )
  }
</script>

<div class="chart-wrap">
  <div class="chart-header">
    <p class="chart-title ui-text">{metricLabel}</p>
    <div class="sort-toggle ui-text" role="group" aria-label="Sort bars by">
      <button
        class:active={sortBy === 'value'}
        onclick={() => sortBy = 'value'}
        aria-pressed={sortBy === 'value'}
      >Value</button>
      <button
        class:active={sortBy === 'alpha'}
        onclick={() => sortBy = 'alpha'}
        aria-pressed={sortBy === 'alpha'}
      >A–Z</button>
    </div>
  </div>

  <svg
    viewBox="0 0 {W} {H}"
    role="img"
    aria-label="{metricLabel} by Boston neighborhood, bar chart"
  >
    <title>{metricLabel} comparison</title>
    <g transform="translate({margin.left},{margin.top})">

      <!-- Grid lines -->
      {#each yTicks as tick}
        <line
          x1={0} x2={innerW}
          y1={yScale(tick)} y2={yScale(tick)}
          stroke="var(--color-border)" stroke-width={0.5} stroke-dasharray="4 4"
        />
      {/each}

      <!-- Y axis labels -->
      {#each yTicks as tick}
        <text
          x={-8} y={yScale(tick)}
          text-anchor="end" dominant-baseline="middle"
          font-family="var(--font-ui)" font-size="11"
          fill="var(--color-text-muted)"
        >{fmtValue(tick)}</text>
      {/each}

      <!-- Bars -->
      {#each sortedData as d (d.neighborhood)}
        {@const bx = xScale(d.neighborhood)}
        {@const bw = xScale.bandwidth()}
        {@const by = yScale(d.value)}
        {@const bh = innerH - by}
        <rect
          x={bx} y={by}
          width={bw} height={Math.max(0, bh)}
          fill={barFill(d)}
          rx={3}
          style="cursor: pointer; transition: fill 200ms ease, height 400ms ease, y 400ms ease;"
          role="button"
          tabindex="0"
          aria-label="{d.neighborhood}: {fmtValue(d.value)}"
          aria-pressed={$selectedNeighborhood === d.neighborhood}
          onmouseenter={e => handleMouseenter(e, d)}
          onmousemove={handleMousemove}
          onmouseleave={handleMouseleave}
          onclick={() => handleClick(d)}
          onkeydown={e => e.key === 'Enter' && handleClick(d)}
        />
        <!-- Value label on top of bar -->
        {#if bh > 18}
          <text
            x={bx + bw / 2} y={by - 4}
            text-anchor="middle"
            font-family="var(--font-ui)" font-size="10"
            fill={$selectedNeighborhood === d.neighborhood ? 'var(--color-primary)' : 'var(--color-text-muted)'}
          >{fmtValue(d.value)}</text>
        {/if}
      {/each}

      <!-- X axis labels (rotated) -->
      <g transform="translate(0,{innerH})">
        <line x1={0} x2={innerW} stroke="var(--color-border)" />
        {#each sortedData as d (d.neighborhood)}
          <g transform="translate({xScale(d.neighborhood) + xScale.bandwidth() / 2}, 8)">
            <text
              transform="rotate(-40)"
              text-anchor="end"
              font-family="var(--font-ui)" font-size="11"
              fill={$selectedNeighborhood === d.neighborhood
                ? 'var(--color-primary)'
                : 'var(--color-text-muted)'}
              font-weight={$selectedNeighborhood === d.neighborhood ? 500 : 400}
            >{truncate(d.neighborhood, 12)}</text>
          </g>
        {/each}
      </g>

    </g>
  </svg>
</div>

<style>
  .chart-wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chart-title {
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .sort-toggle {
    display: flex;
    gap: 2px;
    background: var(--color-border);
    border-radius: 100px;
    padding: 2px;
  }

  .sort-toggle button {
    font-size: 11px;
    font-family: var(--font-ui);
    background: none;
    border: none;
    border-radius: 100px;
    padding: 3px 10px;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: all var(--transition-fast);
  }

  .sort-toggle button.active {
    background: var(--color-surface);
    color: var(--color-text);
    font-weight: 500;
  }

  svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }
</style>
