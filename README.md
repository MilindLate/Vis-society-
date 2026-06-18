# Who Can Afford Boston?

> An interactive scrollytelling data story about the housing affordability crisis in Greater Boston — who is being priced out, who is profiting, and what the data reveals about our city's future.

**MIT · Interactive Visualization & Society · Spring 2026** · Built in partnership with [MAPC](https://www.mapc.org)

---

## Live Demo

🔗 **[milindlate.github.io/Vis-society-](https://milindlate.github.io/Vis-society-)**

---

## Overview

Boston's housing costs have nearly doubled over the last decade. This project uses five years of data from the US Census Bureau, the Metropolitan Area Planning Council, and public eviction records to tell that story — neighborhood by neighborhood, through an interactive visual narrative.

The piece walks through five scrollytelling scenes:

| Step | Story | Visualization |
|------|-------|---------------|
| 01 | Median rents by neighborhood in 2023 | Choropleth map |
| 02 | Which neighborhoods saw the steepest rent growth (2013–2023) | Bar chart, sorted by growth rate |
| 03 | Corporate vs. individual landlord eviction rates | Choropleth map |
| 04 | How MBTA proximity inflates sale prices | Line chart over time |
| 05 | How 1960s HOLC redlining predicts today's eviction rates | Bar chart comparison |

**Click any neighborhood on the map** to filter all charts to that area.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Svelte 4](https://svelte.dev/) |
| Build tool | [Vite 5](https://vitejs.dev/) |
| Data & scales | [D3 v7](https://d3js.org/) |
| Scroll triggers | [Scrollama 3](https://github.com/russellsamora/scrollama) |
| Maps | D3 GeoJSON (SVG-rendered choropleth) |
| Typography | Playfair Display · Source Serif 4 · DM Sans |
| Deploy | GitHub Pages via `gh-pages` |

---

## Project Structure

```
src/
├── App.svelte                  # Top-level layout: hero → intro → scrolly → callout → footer
├── main.js                     # Svelte mount
├── lib/
│   ├── components/
│   │   ├── Scrolly.svelte      # Scrollama wrapper — manages sticky chart + stepping text
│   │   ├── ChartPanel.svelte   # Sticky left panel — routes to Map / Bar / Line per step
│   │   ├── ChoroplethMap.svelte
│   │   ├── BarChart.svelte
│   │   ├── LineChart.svelte
│   │   ├── Tooltip.svelte      # Global tooltip driven by store
│   │   └── ChartPlaceholder.svelte
│   ├── stores/
│   │   └── index.js            # Shared Svelte stores (activeStep, selectedNeighborhood, tooltip…)
│   └── utils/
│       ├── dataLoader.js       # Parallel CSV/JSON loader with fallback geometry
│       ├── dataUtils.js
│       ├── scales.js
│       └── format.js
└── styles/
    ├── tokens.css              # Design tokens (colors, fonts, spacing, transitions)
    └── global.css              # Reset + typography helpers
```

---

## Data Sources

| Dataset | Source | Notes |
|---------|--------|-------|
| Median rent & housing units 2013–2023 | American Community Survey (ACS), US Census Bureau | `data/housing.csv` |
| Eviction filings 2019–2023 | MAPC Eviction Records Dataset | `data/evictions.csv` |
| Residential sale prices | Warren Group (via MAPC) | Analysis only — not published per DUA |
| Neighborhood boundaries | MassGIS / MassDOT | `data/geo_boston.json` |
| MBTA transit stops | MassDOT | Used in step 04 analysis |
| HOLC redlining grades | Mapping Inequality, University of Richmond | Used in step 05 |

> ⚠️ Warren Group data is used for analysis only. Raw records are not published per the Data Use Agreement.

---

## Getting Started

**Prerequisites:** Node.js ≥ 18

```bash
# 1. Clone
git clone https://github.com/MilindLate/Vis-society-.git
cd Vis-society-

# 2. Install
npm install

# 3. Add data files  (see Data section above)
#    public/data/housing.csv
#    public/data/evictions.csv
#    public/data/geo_boston.json   ← optional; app falls back to bounding-box geometry

# 4. Run dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build & Deploy

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
npm run deploy     # build + push to gh-pages branch
```

---

## Architecture Notes

### State management

All cross-component state lives in `src/lib/stores/index.js`:

```js
activeStep            // which scrollama step is active (0–4)
selectedNeighborhood  // neighborhood clicked on map (null = all)
selectedYear          // highlighted year in line chart
tooltip               // { visible, x, y, title, rows }
housingData / evictionData / geoData / dataLoaded
filteredHousing       // derived store: housing filtered by selectedNeighborhood
```

### Scrollytelling layout

`Scrolly.svelte` uses Scrollama to keep the `ChartPanel` sticky on the left while narrative steps scroll on the right. Each step entrance fires `activeStep.set(index)`, which causes `ChartPanel` to swap between `ChoroplethMap`, `BarChart`, and `LineChart` with a fade animation.

### Data loading

`dataLoader.js` loads `housing.csv`, `evictions.csv`, and `geo_boston.json` in parallel. If the GeoJSON is missing (common in dev), it falls back to rectangular bounding-box polygons so the app remains navigable without real boundary files.

---

## Design System

All tokens are defined in `src/styles/tokens.css`:

- **Primary color** `#c0392b` — urgency/crisis (warm red)
- **Secondary color** `#1a7a5e` — hope/affordability (teal)
- **Display font** Playfair Display (editorial feel)
- **Body font** Source Serif 4 (long-form readability)
- **UI font** DM Sans (labels, captions, metadata)

---

## Key Findings

- Boston's average neighborhood median rent climbed from ~$1,400/month (2013) to ~$2,700/month (2023).
- South Boston and Back Bay saw the steepest absolute increases; Roxbury and East Boston saw the highest *rates* of growth despite having fewer alternatives.
- Corporate landlords (owning 10+ units) filed evictions at nearly **3×** the rate of individual landlords in 2022–2023.
- Properties within half a mile of an MBTA station command a significant price premium, concentrating affordable options in car-dependent outer neighborhoods.
- Neighborhoods historically graded 'D' (Hazardous) by the 1960s HOLC now show eviction rates up to **4×** higher than 'A'-graded neighborhoods — a pattern that maps almost exactly onto race.

---

## Acknowledgements

We thank the Wampanoag Nation and the Massachusett Peoples on whose lands MIT sits. We also acknowledge that, through the Morrill Act of 1862, MIT benefited from the stolen territories of 82 Tribes. For more, see [Land-Grab University](https://www.landgrabu.org/).

---

## License

Data used under respective source licenses. Code MIT © 2026 Milind Late.
