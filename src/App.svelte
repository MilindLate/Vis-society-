<script>
  import { onMount } from 'svelte'
  import { loadAll }  from './lib/utils/dataLoader.js'
  import { dataLoaded } from './lib/stores/index.js'

  import Tooltip    from './lib/components/Tooltip.svelte'
  import Scrolly    from './lib/components/Scrolly.svelte'
  import ChartPanel from './lib/components/ChartPanel.svelte'

  // Narrative steps — each drives the chart panel via activeStep store.
  // Subtext shown in smaller type below the main sentence.
  const steps = [
    {
      text: "Boston's housing costs have nearly doubled over the last decade. In 2013, the average neighborhood median rent was around $1,400/month. By 2023, it had climbed past $2,700 — pricing out long-time residents across the city.",
      subtext: "Map: Median monthly rent by neighborhood (2023). Click any neighborhood to explore it."
    },
    {
      text: "The surge hasn't been uniform. South Boston and Back Bay saw the steepest climbs. Meanwhile, Roxbury and East Boston — historically lower-income, majority-renter neighborhoods — experienced the highest growth rates, leaving residents with the fewest alternatives.",
      subtext: "Bars show % rent growth 2013–2023. Sorted by growth rate."
    },
    {
      text: "Eviction filings tell another story. Corporate landlords — those owning 10 or more units — filed evictions at nearly 3× the rate of individual landlords in 2022 and 2023. Roxbury and Dorchester bear the heaviest burden.",
      subtext: "Map: Eviction rate per 1,000 renters (2023). Redder = higher rate."
    },
    {
      text: "Transit access shapes sale prices — and shapes who can afford to stay. Properties within half a mile of an MBTA station sell for a significant premium, compressing affordable options into car-dependent outer neighborhoods.",
      subtext: "Lines show median sale price over time. Select a neighborhood to isolate its trend."
    },
    {
      text: "The legacy of 1960s redlining echoes today. Neighborhoods historically graded 'D' (Hazardous) by the HOLC now show eviction rates up to 4× higher than those graded 'A' — a pattern that maps almost exactly onto race.",
      subtext: "Compare eviction rates across neighborhoods. The divide between high- and low-rated areas persists."
    },
  ]

  onMount(async () => {
    await loadAll()
  })
</script>

<!-- Global tooltip — one instance, driven by store -->
<Tooltip />

<!-- ── HERO ──────────────────────────────────── -->
<header class="hero">
  <div class="hero-inner">
    <span class="hero-eyebrow ui-text">MIT · Interactive Visualization &amp; Society · Spring 2026</span>
    <h1 class="hero-title">
      Who Can Afford<br />
      <em>Boston?</em>
    </h1>
    <p class="hero-subtitle">
      An interactive data story about the housing affordability crisis in
      Greater Boston — who is being priced out, who is profiting, and what
      the data reveals about our city's future.
    </p>
    <div class="hero-meta ui-text">
      <span>Data: MAPC · ACS 2013–2023 · Census 2020</span>
      <span class="sep" aria-hidden="true">·</span>
      <span>Built in partnership with MAPC</span>
    </div>
    <a href="#story" class="scroll-cue ui-text" aria-label="Scroll to begin the story">
      Scroll to explore
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3v10M3 9l5 5 5-5"
          stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </a>
  </div>
  <div class="hero-grid" aria-hidden="true"></div>
</header>

<!-- ── INTRO ─────────────────────────────────── -->
<section class="intro" aria-labelledby="intro-heading">
  <div class="intro-inner">
    <h2 id="intro-heading" class="sr-only">Introduction</h2>
    <p class="intro-text">
      Greater Boston is in a housing crisis. Rents have surged, evictions have
      climbed, and the gap between who can afford to stay and who is forced to
      leave has never been wider. But the crisis does not fall evenly — it
      follows the fault lines of race, income, and history.
    </p>
    <p class="intro-text">
      Using data from the Metropolitan Area Planning Council, the US Census
      Bureau, and public eviction records, this story maps the crisis
      neighborhood by neighborhood. Scroll to explore.
    </p>
    <p class="intro-hint ui-text">
      💡 Click any neighborhood on the map to filter all charts to that area.
    </p>
  </div>
</section>

<!-- ── SCROLLYTELLING ────────────────────────── -->
<main id="story" aria-label="Interactive data story">
  {#if !$dataLoaded}
    <div class="loading" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p class="ui-text">Loading data…</p>
    </div>
  {:else}
    <Scrolly {steps}>
      <svelte:fragment slot="chart">
        <ChartPanel />
      </svelte:fragment>
    </Scrolly>
  {/if}
</main>

<!-- ── CALLOUT ───────────────────────────────── -->
<section class="callout" aria-labelledby="callout-heading">
  <div class="callout-inner">
    <h2 id="callout-heading">What Can Be Done?</h2>
    <div class="callout-grid">
      <div class="callout-card">
        <span class="callout-icon" aria-hidden="true">🏗️</span>
        <h3>Increase Supply</h3>
        <p>Zoning reform to allow more multifamily housing near transit reduces pressure on existing stock and creates more options for lower-income renters.</p>
      </div>
      <div class="callout-card">
        <span class="callout-icon" aria-hidden="true">🛡️</span>
        <h3>Strengthen Protections</h3>
        <p>Just-cause eviction laws and rent stabilization policies reduce displacement risk in neighborhoods with the highest eviction rates.</p>
      </div>
      <div class="callout-card">
        <span class="callout-icon" aria-hidden="true">📊</span>
        <h3>Invest in Data</h3>
        <p>Better tracking of corporate landlord activity and displacement patterns enables more targeted policy intervention at the neighborhood level.</p>
      </div>
    </div>
  </div>
</section>

<!-- ── FOOTER ────────────────────────────────── -->
<footer class="footer" aria-label="Project information and data sources">
  <div class="footer-inner">
    <div class="footer-left">
      <p class="footer-title">Who Can Afford Boston?</p>
      <p class="footer-sub ui-text">MIT Interactive Visualization &amp; Society · Spring 2026</p>
      <p class="footer-sub ui-text" style="margin-top: 0.5rem;">
        Built in partnership with the
        <a href="https://www.mapc.org" target="_blank" rel="noopener noreferrer">
          Metropolitan Area Planning Council
        </a>
      </p>
    </div>
    <div class="footer-right ui-text">
      <p class="footer-sources-title">Data Sources</p>
      <ul class="footer-sources">
        <li>American Community Survey (ACS) 2013–2023, US Census Bureau</li>
        <li>Census 2020, US Census Bureau</li>
        <li>MAPC Eviction Records Dataset</li>
        <li>Warren Group Residential Sales (via MAPC) — not published per DUA</li>
        <li>MassDOT / MBTA Transit Data</li>
        <li>MassGIS Boundary Files</li>
        <li>Mapping Inequality, University of Richmond (HOLC grades)</li>
      </ul>
      <p class="footer-warning">
        ⚠ Warren Group data used for analysis only; raw data not published per Data Use Agreement.
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
    background: #0f0f0d;
    color: #fff;
  }

  .hero-inner {
    position: relative;
    z-index: 2;
    max-width: var(--max-width);
    margin: 0 auto;
    padding: var(--space-24) var(--space-8);
    width: 100%;
  }

  .hero-eyebrow {
    display: block;
    font-size: var(--text-xs);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: var(--space-6);
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(3rem, 9vw, 6.5rem);
    font-weight: 700;
    line-height: 1.0;
    color: #fff;
    margin-bottom: var(--space-6);
  }

  .hero-title em {
    font-style: italic;
    color: #e74c3c;
  }

  .hero-subtitle {
    font-size: clamp(var(--text-base), 2vw, var(--text-xl));
    line-height: var(--leading-loose);
    color: rgba(255,255,255,0.65);
    max-width: 580px;
    margin-bottom: var(--space-8);
    font-family: var(--font-body);
  }

  .hero-meta {
    font-size: var(--text-sm);
    color: rgba(255,255,255,0.3);
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin-bottom: var(--space-16);
  }

  .sep { color: rgba(255,255,255,0.15); }

  .scroll-cue {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: rgba(255,255,255,0.4);
    text-decoration: none;
    font-size: var(--text-sm);
    transition: color var(--transition-fast);
    animation: nudge 2.2s ease-in-out infinite;
  }

  .scroll-cue:hover { color: rgba(255,255,255,0.9); }
  .scroll-cue:focus-visible { color: #fff; }

  @keyframes nudge {
    0%, 100% { transform: translateY(0); }
    55%       { transform: translateY(7px); }
  }

  .hero-grid {
    position: absolute;
    inset: 0;
    z-index: 1;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%);
  }

  /* ── INTRO ── */
  .intro {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-24) var(--space-8);
  }

  .intro-text {
    font-size: clamp(var(--text-lg), 2vw, var(--text-xl));
    line-height: var(--leading-loose);
    margin-bottom: var(--space-6);
  }

  .intro-hint {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    background: var(--color-secondary-pale);
    border: 1px solid #b7dfd1;
    border-radius: var(--border-radius);
    padding: var(--space-3) var(--space-4);
    margin-top: var(--space-4);
    display: inline-block;
  }

  /* ── STORY ── */
  #story {
    padding: var(--space-12) 0 var(--space-24);
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

  .spinner {
    width: 36px;
    height: 36px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── CALLOUT ── */
  .callout {
    background: #0f0f0d;
    color: #fff;
    padding: var(--space-24) var(--space-8);
    margin-top: var(--space-24);
  }

  .callout-inner {
    max-width: var(--max-width);
    margin: 0 auto;
  }

  .callout h2 {
    font-family: var(--font-display);
    font-size: clamp(var(--text-2xl), 4vw, var(--text-4xl));
    color: #fff;
    margin-bottom: var(--space-12);
  }

  .callout-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--space-6);
  }

  .callout-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: var(--border-radius-lg);
    padding: var(--space-8);
  }

  .callout-icon {
    display: block;
    font-size: 2rem;
    margin-bottom: var(--space-4);
  }

  .callout-card h3 {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: #fff;
    margin-bottom: var(--space-3);
  }

  .callout-card p {
    font-size: var(--text-base);
    line-height: var(--leading-loose);
    color: rgba(255,255,255,0.6);
    font-family: var(--font-body);
  }

  /* ── FOOTER ── */
  .footer {
    background: #0a0a08;
    padding: var(--space-16) var(--space-8);
  }

  .footer-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    gap: var(--space-12);
    flex-wrap: wrap;
  }

  .footer-title {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: #fff;
    margin-bottom: var(--space-2);
  }

  .footer-sub {
    font-size: var(--text-sm);
    color: rgba(255,255,255,0.4);
  }

  .footer-sub a {
    color: rgba(255,255,255,0.6);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .footer-right {
    max-width: 420px;
  }

  .footer-sources-title {
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: var(--space-3);
  }

  .footer-sources {
    list-style: none;
    font-size: var(--text-xs);
    color: rgba(255,255,255,0.35);
    line-height: 2;
  }

  .footer-warning {
    margin-top: var(--space-4);
    font-size: var(--text-xs);
    color: rgba(255, 180, 80, 0.6);
  }

  /* ── UTILITIES ── */
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
