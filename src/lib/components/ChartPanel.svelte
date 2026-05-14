<script>
  // =============================================
  // CHART PANEL
  // The sticky left panel in the scrollytelling layout.
  // Switches between Map / LineChart / BarChart
  // based on the active scroll step.
  // =============================================
  import { activeStep } from '../stores/index.js'
  import ChoroplethMap from './ChoroplethMap.svelte'
  import LineChart     from './LineChart.svelte'
  import BarChart      from './BarChart.svelte'

  // Which chart component to show per step
  // Steps: 0=intro rent map, 1=growth bars, 2=eviction map,
  //        3=price line, 4=eviction rate bars
  const stepCharts = ['map', 'bar', 'map', 'line', 'bar']
  $: activeChart = stepCharts[$activeStep] ?? 'map'
</script>

<div class="panel" aria-live="polite" aria-atomic="false">
  {#if activeChart === 'map'}
    <div class="chart-slot" aria-label="Map visualization">
      <ChoroplethMap />
    </div>
  {:else if activeChart === 'line'}
    <div class="chart-slot" aria-label="Line chart visualization">
      <LineChart />
    </div>
  {:else if activeChart === 'bar'}
    <div class="chart-slot" aria-label="Bar chart visualization">
      <BarChart />
    </div>
  {/if}

  <!-- Step indicator dots -->
  <div class="step-dots" role="presentation" aria-hidden="true">
    {#each stepCharts as _, i}
      <span class="dot" class:active={$activeStep === i}></span>
    {/each}
  </div>
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  }

  .chart-slot {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 350ms ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

  .step-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: var(--space-3);
    border-top: 1px solid var(--color-border);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-border);
    transition: background var(--transition-normal), transform var(--transition-fast);
  }

  .dot.active {
    background: var(--color-primary);
    transform: scale(1.3);
  }
</style>
