# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

There are no tests in this project.

## Architecture

**coffee-sim** is a Next.js 16 + React 19 + Tailwind CSS 4 espresso/coffee simulator. It uses the App Router with i18n via a `[locale]` dynamic segment (`es` / `en`). The root `app/page.tsx` redirects to `/es`.

### Data flow

```
app/[locale]/page.tsx  (Server Component)
  → getDictionary(locale)          lib/getDictionary.ts → dictionaries/{es,en}.json
  → <SimulatorPage dict locale />  components/SimulatorPage.tsx  (all state lives here)
      → simulateCoffee(method, inputs)   engine/simulationEngine.ts
           → simulateEspresso(inputs)    engine/espressoEngine.ts
      → <SimulatorHero />          header, method selector, recipe name/save/copy
      → <SimulatorResultPanel />   extraction result, FlavorRadar, ExtractionMap, HybridRadarMap
      → <SimulatorControlsPanel /> sliders (grind, ratio, temp, pressure, water), selects, presets, saved recipes
```

### Engine (`engine/`)

- **`espressoEngine.ts`** — the only real physics engine. Computes extraction (0–100), shot time, extraction state (`Subextraído` / `Balanceado` / `Sobreextraído`), style hint (`Ristretto` / `Espresso` / `Lungo`), and a `FlavorAxes` sensory profile (acidez, dulzor, amargor, astringencia, cuerpo).
- **`simulationEngine.ts`** — dispatcher by `BrewMethod`. Currently all methods (`v60`, `french_press`, `aeropress`, `moka`, `cold_brew`) temporarily delegate to `simulateEspresso`. Method-specific engines need to be created here.

### Key types

- `BrewMethod` — `components/types/brew.ts`
- `Roast` (`claro` | `medio` | `oscuro`), `Process` (`lavado` | `natural` | `honey`), `EspressoInputs`, `EspressoResult`, `FlavorAxes` — all in `engine/espressoEngine.ts`
- `SavedRecipe` — defined locally in both `SimulatorPage.tsx` and `SimulatorControlsPanel.tsx` (duplicated)

### State & persistence

- All simulator state lives in `SimulatorPage` and is passed down as props.
- URL query params (`grind`, `ratio`, `roast`, `process`, `name`, `temperature`, `pressure`, `waterGH`, `waterKH`) are synced via `useEffect` — recipes can be shared as links.
- Saved recipes are persisted to `localStorage` under the key `coffee-sim-recipes`.

### i18n

All UI strings come from `dict` (a `Dict = Record<string, any>` loaded from `dictionaries/{locale}.json`). Both files must be kept in sync when adding new keys.
