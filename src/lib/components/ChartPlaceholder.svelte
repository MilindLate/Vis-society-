<script>
  // ChartPlaceholder.svelte
  // Temporary placeholder — replace with real charts in Phase 4
  // Shows which step is active so you can test scrollytelling works

  import { activeStep } from '../stores/index.js'

  // Each step has a different highlight color to visually confirm transitions
  const stepColors = ['#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#2980b9']

  $: color = stepColors[$activeStep % stepColors.length]
</script>

<div class="placeholder" style="border-color: {color}">
  <div class="placeholder-inner">
    <p class="label ui-text">Chart Area</p>
    <p class="step-indicator ui-text">
      Active step:
      <strong style="color: {color}">{$activeStep + 1}</strong>
    </p>
    <p class="hint">
      Replace this with<br/>
      your D3 chart component
    </p>

    <!-- Fake chart bars that react to step -->
    <div class="fake-bars">
      {#each [0.4, 0.7, 0.55, 0.9, 0.65, 0.8, 0.5] as h, i}
        <div
          class="bar"
          style="
            height: {h * 100 * (1 + $activeStep * 0.1)}px;
            background: {color};
            opacity: {0.4 + i * 0.08};
            transition: height 600ms ease;
          "
        ></div>
      {/each}
    </div>
  </div>
</div>

<style>
  .placeholder {
    width: 100%;
    height: 100%;
    border: 2px dashed var(--color-border);
    border-radius: var(--border-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color var(--transition-normal);
    background: var(--color-surface);
  }

  .placeholder-inner {
    text-align: center;
    padding: var(--space-8);
  }

  .label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-faint);
    margin-bottom: var(--space-2);
  }

  .step-indicator {
    font-size: var(--text-2xl);
    color: var(--color-text-muted);
    margin-bottom: var(--space-4);
  }

  .hint {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    font-family: var(--font-ui);
    line-height: 1.6;
    margin-bottom: var(--space-8);
  }

  .fake-bars {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 120px;
    justify-content: center;
  }

  .bar {
    width: 24px;
    border-radius: 3px 3px 0 0;
  }
</style>
