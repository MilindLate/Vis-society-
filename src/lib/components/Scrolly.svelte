<script>
  import { onMount, onDestroy } from 'svelte'
  import scrollama from 'scrollama'
  import { activeStep } from '../stores/index.js'

  // Steps array passed in from parent
  // Each step: { text, subtext? }
  export let steps = []

  // How far down the viewport to trigger (0.5 = middle)
  export let triggerOffset = 0.5

  let scroller
  let stepEls = []

  onMount(() => {
    scroller = scrollama()
    scroller
      .setup({
        step: '.scrolly-step',
        offset: triggerOffset,
        debug: false,
      })
      .onStepEnter(({ index }) => {
        activeStep.set(index)
      })

    // Resize handler
    window.addEventListener('resize', scroller.resize)
  })

  onDestroy(() => {
    if (scroller) scroller.destroy()
    window.removeEventListener('resize', scroller.resize)
  })
</script>

<section class="scrolly-container">
  <!-- LEFT: sticky chart panel — slot for whatever chart you pass in -->
  <div class="scrolly-sticky" aria-hidden="true">
    <slot name="chart" />
  </div>

  <!-- RIGHT: scrolling text steps -->
  <div class="scrolly-steps" role="list">
    {#each steps as step, i}
      <div
        class="scrolly-step"
        class:is-active={$activeStep === i}
        role="listitem"
        aria-label="Step {i + 1} of {steps.length}"
        bind:this={stepEls[i]}
      >
        <div class="step-content">
          <span class="step-number ui-text">{String(i + 1).padStart(2, '0')}</span>
          <p class="step-text">{step.text}</p>
          {#if step.subtext}
            <p class="step-subtext">{step.subtext}</p>
          {/if}
        </div>
      </div>
    {/each}

    <!-- Spacer so last step can trigger -->
    <div class="scrolly-end-spacer" aria-hidden="true"></div>
  </div>
</section>

<style>
  .scrolly-container {
    display: flex;
    align-items: flex-start;
    gap: var(--space-8);
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 var(--space-8);
  }

  /* Sticky chart panel */
  .scrolly-sticky {
    position: sticky;
    top: 0;
    width: var(--chart-width);
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Scrolling text column */
  .scrolly-steps {
    width: var(--story-width);
    padding-top: 40vh;
  }

  .scrolly-end-spacer {
    height: 40vh;
  }

  /* Individual step card */
  .scrolly-step {
    margin-bottom: 70vh;
    opacity: 0.35;
    transition: opacity var(--transition-slow);
  }

  .scrolly-step.is-active {
    opacity: 1;
  }

  .step-content {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-6) var(--space-8);
    position: relative;
  }

  /* Active step gets a left accent bar */
  .scrolly-step.is-active .step-content {
    border-left: 3px solid var(--color-primary);
  }

  .step-number {
    display: block;
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.1em;
    color: var(--color-primary);
    margin-bottom: var(--space-3);
    text-transform: uppercase;
  }

  .step-text {
    font-size: var(--text-lg);
    line-height: var(--leading-loose);
    color: var(--color-text);
    font-family: var(--font-body);
  }

  .step-subtext {
    margin-top: var(--space-3);
    font-size: var(--text-sm);
    font-family: var(--font-ui);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
  }

  /* Mobile: stack chart above text */
  @media (max-width: 768px) {
    .scrolly-container {
      flex-direction: column;
      padding: 0 var(--space-4);
    }

    .scrolly-sticky {
      position: relative;
      width: 100%;
      height: 50vh;
      top: 0;
    }

    .scrolly-steps {
      width: 100%;
      padding-top: var(--space-8);
    }

    .scrolly-step {
      margin-bottom: var(--space-12);
      opacity: 1;
    }
  }
</style>
