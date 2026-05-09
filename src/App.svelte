<script>
  import { onMount } from 'svelte'
  import { loadAll } from './lib/utils/dataLoader.js'
  import { dataLoaded, selectedNeighborhood } from './lib/stores/index.js'

  import Tooltip       from './lib/components/Tooltip.svelte'
  import Scrolly       from './lib/components/Scrolly.svelte'
  import ChartPlaceholder from './lib/components/ChartPlaceholder.svelte'

  // Story steps — each one drives what the chart shows
  // You'll update these in Phase 4 when real charts are built
  const steps = [
    {
      text: "Boston's housing costs have nearly doubled over the last decade. In 2013, the median rent was $1,400/month. By 2023, it had climbed to $2,700 — pricing out long-time residents across entire neighborhoods.",
      subtext: "Source: ACS 2013–2023, US Census Bureau"
    },
    {
      text: "The surge hasn't been uniform. Neighborhoods like East Boston and Roxbury saw rent increases of over 80% — far outpacing income growth in the same period.",
      subtext: "Darker colors indicate higher rent growth since 2013."
    },
    {
      text: "Eviction filings tell another story. Corporate landlords — those owning 10+ units — filed evictions at 3× the rate of individual landlords in 2022 and 2023.",
      subtext: "Source: MAPC Eviction Records dataset"
    },
    {
      text: "Transit access shapes housing demand. Properties within half a mile of an MBTA station sell for 22% more than comparable units further away — pushing lower-income renters to car-dependent outer neighborhoods.",
      subtext: "Source: Warren Group Sales Data (via MAPC)"
    },
    {
      text: "The legacy of 1960s redlining still shapes today's map. Neighborhoods historically graded 'D' (Hazardous) by the HOLC now have eviction rates 4× higher than those graded 'A'.",
      subtext: "Source: Mapping Inequality, University of Richmond"
    },
  ]

  onMount(async () => {
    await loadAll()
  })
</script>

<!-- Global tooltip — always rendered, controlled by store -->
<Tooltip />

<!-- =============================================
     HERO SECTION
     ============================================= -->
<header class="hero">
  <div class="hero-inner">
    <div class="hero-tag ui-text">MIT Vis & Society · Spring 2026</div>
    <h1 class="hero-title">Who Can Afford<br/><em>Boston?</em></h1>
    <p class="hero-subtitle">
      An interactive data story about the housing affordability crisis
      in Greater Boston — who's being priced out, who's profiting,
      and what the data reveals about our city's future.
    </p>
    <div class="hero-meta ui-text">
      <span>Built in partnership with MAPC</span>
      <span class="dot">·</span>
      <span>Data: ACS 2013–2023, MAPC, Census 2020</span>
    </div>
    <a href="#story" class="scroll-cue" aria-label="Scroll to begin reading">
      <span class="ui-text">Scroll to explore</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
  </div>

  <!-- Background texture -->
  <div class="hero-bg" aria-hidden="true">
    <div class="hero-grid"></div>
  </div>
</header>

<!-- =============================================
     INTRO PARAGRAPH
     ============================================= -->
<section class="intro" id="story">
  <div class="intro-inner">
    <p class="intro-text">
      Greater Boston is in a housing crisis. Rents have surged, evictions have
      climbed, and the gap between who can afford to stay and who is forced to
      leave has never been wider. But the crisis is not evenly distributed —
      it follows the fault lines of race, income, and history.
    </p>
    <p class="intro-text">
      Using data from the Metropolitan Area Planning Council, the US Census,
      and public records, this story maps the crisis neighborhood by neighborhood.
      Scroll to explore.
    </p>
  </div>
</section>

<!-- =============================================
     MAIN SCROLLYTELLING SECTION
     ============================================= -->
<main class="story-section">
  {#if !$dataLoaded}
    <div class="loading" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p class="ui-text">Loading data…</p>
    </div>
  {:else}
    <Scrolly {steps}>
      <!-- The sticky chart panel -->
      <svelte:fragment slot="chart">
        <ChartPlaceholder />
        <!-- Phase 4: replace ChartPlaceholder with your real chart -->
        <!-- e.g. <ChoroplethMap /> or <LineChart /> -->
      </svelte:fragment>
    </Scrolly>
  {/if}
</main>

<!-- =============================================
     SELECTED NEIGHBORHOOD CALLOUT
     ============================================= -->
{#if $selectedNeighborhood}
  <div class="neighborhood-banner" role="status">
    <p class="ui-text">
      Viewing: <strong>{$selectedNeighborhood}</strong>
      <button
        class="clear-btn ui-text"
        onclick={() => selectedNeighborhood.set(null)}
      >
        Clear ✕
      </button>
    </p>
  </div>
{/if}

<!-- =============================================
     FOOTER
     ============================================= -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-left">
      <p class="footer-title">Housing Affordability in Metro Boston</p>
      <p class="footer-sub ui-text">
        MIT Interactive Visualization & Society · Spring 2026
      </p>
    </div>
    <div class="footer-right ui-text">
      <p>Data sources: MAPC, Warren Group (via MAPC), ACS 2013–2023,</p>
      <p>Census 2020, MassDOT, MassGIS, Mapping Inequality</p>
      <p class="footer-warning">
        ⚠ Warren Group residential sales data not published per Data Use Agreement.
      </p>
    </div>
  </div>
</footer>

<style>
  /* ── HERO ── */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: var(--color-text);
    color: #fff;
  }

  .hero-inner {
    position: relative;
    z-index: 2;
    max-width: var(--max-width);
    margin: 0 auto;
    padding: var(--space-24) var(--space-8);
  }

  .hero-tag {
    font-size: var(--text-xs);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin-bottom: var(--space-6);
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 700;
    line-height: 1.05;
    color: #fff;
    margin-bottom: var(--space-6);
  }

  .hero-title em {
    font-style: italic;
    color: var(--color-primary-light);
  }

  .hero-subtitle {
    font-size: var(--text-xl);
    line-height: var(--leading-loose);
    color: rgba(255,255,255,0.75);
    max-width: 600px;
    margin-bottom: var(--space-8);
    font-family: var(--font-body);
  }

  .hero-meta {
    font-size: var(--text-sm);
    color: rgba(255,255,255,0.4);
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-12);
  }

  .dot { color: rgba(255,255,255,0.2); }

  .scroll-cue {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    font-size: var(--text-sm);
    font-family: var(--font-ui);
    transition: color var(--transition-fast);
    animation: bounce 2s ease-in-out infinite;
  }

  .scroll-cue:hover { color: #fff; }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(6px); }
  }

  /* Background grid */
  .hero-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .hero-grid {
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* ── INTRO ── */
  .intro {
    padding: var(--space-24) var(--space-8);
    max-width: 740px;
    margin: 0 auto;
  }

  .intro-text {
    font-size: var(--text-xl);
    line-height: var(--leading-loose);
    color: var(--color-text);
    margin-bottom: var(--space-6);
  }

  /* ── STORY ── */
  .story-section {
    padding: var(--space-16) 0;
    min-height: 100vh;
  }

  /* ── LOADING ── */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    gap: var(--space-4);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── NEIGHBORHOOD BANNER ── */
  .neighborhood-banner {
    position: fixed;
    bottom: var(--space-6);
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-text);
    color: #fff;
    padding: var(--space-3) var(--space-6);
    border-radius: 100px;
    font-size: var(--text-sm);
    z-index: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }

  .clear-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    margin-left: var(--space-4);
    font-size: var(--text-sm);
    transition: color var(--transition-fast);
  }

  .clear-btn:hover { color: #fff; }

  /* ── FOOTER ── */
  .footer {
    background: var(--color-text);
    color: rgba(255,255,255,0.5);
    padding: var(--space-12) var(--space-8);
    margin-top: var(--space-24);
  }

  .footer-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    gap: var(--space-8);
    flex-wrap: wrap;
  }

  .footer-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: #fff;
    margin-bottom: var(--space-2);
  }

  .footer-sub {
    font-size: var(--text-sm);
  }

  .footer-right {
    font-size: var(--text-xs);
    line-height: 1.8;
    text-align: right;
  }

  .footer-warning {
    color: rgba(255, 180, 100, 0.7);
    margin-top: var(--space-2);
  }
</style>
