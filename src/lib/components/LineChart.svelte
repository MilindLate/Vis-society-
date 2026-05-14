<script>
  // =============================================
  // LINE CHART
  // Rent / price trends over time.
  // Multi-line: one per neighborhood.
  // Selected neighborhood is highlighted; others dim.
  // Lines animate in on mount and on step change.
  // =============================================
  import { onMount, tick } from 'svelte'
  import * as d3 from 'd3'
  import { housingData, selectedNeighborhood, activeStep, tooltip } from '../stores/index.js'
  import { allNeighborhoodSeries } from '../utils/dataUtils.js'
  import { fmtDollar, fmtAxis, fmtYear } from '../utils/format.js'

  // Which metric to show, driven by scroll step
  const stepMetrics = ['median_rent', 'median_rent', 'median_rent', 'median_price', 'median_rent']
  $: metric = stepMetrics[$activeStep] ?? 'median_rent'
  $: metricLabel = metric === 'median_rent' ? 'Median Monthly Rent' : 'Median Sale Price'

  // Dimensions
  const W = 560, H = 380
  const margin = { top: 24, right: 24, bottom: 40, left: 64 }
  const innerW = W - margin.left - margin.right
  const innerH = H - margin.top  - margin.bottom

  // All series
  $: series = allNeighborhoodSeries($housingData)
  $: years  = [...new Set($housingData.map(d => d.year))].sort()

  // Scales
  $: xScale = d3.scaleLinear()
    .domain(d3.extent(years))
    .range([0, innerW])

  $: yScale = d3.scaleLinear()
    .domain([0, d3.max($housingData, d => d[metric]) * 1.1])
    .range([innerH, 0])
    .nice()

  // Color: each neighborhood gets a distinct hue
  $: colorScale = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(series.map(s => s.neighborhood))

  // Line generator
  $: lineGen = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d[metric]))
    .curve(d3.curveMonotoneX)
    .defined(d => !isNaN(d[metric]))

  // X axis ticks
  $: xTicks = years
  $: yTicks = yScale.ticks(5)

  // Tooltip
  function handleMouseenter(event, s) {
    const latest = s.values[s.values.length - 1]
    tooltip.set({
      visible: true, x: event.clientX, y: event.clientY,
      title: s.neighborhood,
      rows: [
        { label: metricLabel, value: fmtDollar(latest[metric]) },
        { label: 'Year', value: String(latest.year) },
      ],
    })
  }
  function handleMousemove(event) {
    tooltip.update(t => ({ ...t, x: event.clientX, y: event.clientY }))
  }
  function handleMouseleave() {
    tooltip.update(t => ({ ...t, visible: false }))
  }
  function handleClick(s) {
    selectedNeighborhood.update(cur =>
      cur === s.neighborhood ? null : s.neighborhood
    )
  }

  // Animate line drawing on mount / metric change
  let pathEls = {}
  async function animatePaths() {
    await tick()
    Object.values(pathEls).forEach(el => {
      if (!el) return
      const len = el.getTotalLength()
      el.style.strokeDasharray  = len
      el.style.strokeDashoffset = len
      el.getBoundingClientRect() // force reflow
      el.style.transition = 'stroke-dashoffset 800ms ease'
      el.style.strokeDashoffset = '0'
    })
  }
  onMount(animatePaths)
  $: metric, animatePaths()
</script>

<div class="chart-wrap">
  <p class="chart-title ui-text">{metricLabel} by Neighborhood (2013–2023)</p>

  <svg
    viewBox="0 0 {W} {H}"
    role="img"
    aria-label="{metricLabel} trend lines for Boston neighborhoods 2013–2023"
  >
    <title>{metricLabel} trends</title>
    <g transform="translate({margin.left},{margin.top})">

      <!-- Grid lines -->
      {#each yTicks as tick}
        <line
          x1={0} x2={innerW}
          y1={yScale(tick)} y2={yScale(tick)}
          stroke="var(--color-border)"
          stroke-width={0.5}
          stroke-dasharray="4 4"
        />
      {/each}

      <!-- X axis -->
      <g transform="translate(0,{innerH})">
        {#each xTicks as year}
          <g transform="translate({xScale(year)},0)">
            <line y2={6} stroke="var(--color-border)" />
            <text
              y={20} text-anchor="middle"
              font-family="var(--font-ui)" font-size="11"
              fill="var(--color-text-muted)"
            >{fmtYear(year)}</text>
          </g>
        {/each}
        <line x1={0} x2={innerW} stroke="var(--color-border)" />
      </g>

      <!-- Y axis -->
      <g>
        {#each yTicks as tick}
          <text
            x={-8} y={yScale(tick)}
            text-anchor="end" dominant-baseline="middle"
            font-family="var(--font-ui)" font-size="11"
            fill="var(--color-text-muted)"
          >{fmtAxis(tick)}</text>
        {/each}
      </g>

      <!-- Lines -->
      {#each series as s (s.neighborhood)}
        {@const isSelected = $selectedNeighborhood === s.neighborhood}
        {@const isDimmed   = $selectedNeighborhood && !isSelected}
        <path
          bind:this={pathEls[s.neighborhood]}
          d={lineGen(s.values)}
          fill="none"
          stroke={colorScale(s.neighborhood)}
          stroke-width={isSelected ? 3 : 1.5}
          stroke-opacity={isDimmed ? 0.12 : 1}
          style="cursor: pointer; transition: stroke-opacity 250ms ease, stroke-width 150ms ease;"
          role="button"
          tabindex="0"
          aria-label="{s.neighborhood} rent trend"
          aria-pressed={isSelected}
          onmouseenter={e => handleMouseenter(e, s)}
          onmousemove={handleMousemove}
          onmouseleave={handleMouseleave}
          onclick={() => handleClick(s)}
          onkeydown={e => e.key === 'Enter' && handleClick(s)}
        />
      {/each}

      <!-- End-of-line labels for selected or hovered -->
      {#each series as s (s.neighborhood)}
        {@const isSelected = $selectedNeighborhood === s.neighborhood}
        {#if isSelected || !$selectedNeighborhood}
          {@const last = s.values[s.values.length - 1]}
          {#if last}
            <text
              x={xScale(last.year) + 6}
              y={yScale(last[metric])}
              dominant-baseline="middle"
              font-family="var(--font-ui)"
              font-size={isSelected ? 12 : 10}
              font-weight={isSelected ? 500 : 400}
              fill={colorScale(s.neighborhood)}
              fill-opacity={$selectedNeighborhood && !isSelected ? 0.2 : 1}
            >{s.neighborhood.split(' ')[0]}</text>
          {/if}
        {/if}
      {/each}

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

  .chart-title {
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }
</style>
