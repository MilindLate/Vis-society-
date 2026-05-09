<script>
  import { tooltip } from '../stores/index.js'
</script>

<!-- Global tooltip — rendered once in App.svelte, driven by the store -->
{#if $tooltip.visible}
  <div
    class="tooltip"
    style="left: {$tooltip.x + 12}px; top: {$tooltip.y - 10}px"
    role="tooltip"
  >
    {#if $tooltip.title}
      <p class="tooltip-title">{$tooltip.title}</p>
    {/if}
    {#each $tooltip.rows as row}
      <div class="tooltip-row">
        <span class="tooltip-label">{row.label}</span>
        <span class="tooltip-value">{row.value}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    pointer-events: none;
    background: var(--color-text);
    color: #fff;
    padding: 8px 12px;
    border-radius: var(--border-radius);
    font-family: var(--font-ui);
    font-size: var(--text-sm);
    line-height: 1.5;
    max-width: 220px;
    z-index: 1000;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  .tooltip-title {
    font-weight: 500;
    margin-bottom: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .tooltip-label {
    color: rgba(255,255,255,0.7);
  }

  .tooltip-value {
    font-weight: 500;
  }
</style>
