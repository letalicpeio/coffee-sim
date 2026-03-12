# CLAUDE.md

## Commands
```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```
There are no tests in this project.

## Language
Always respond in Spanish.

## Architecture
**coffee-sim** is a Next.js + React + Tailwind CSS coffee simulator. 
App Router with i18n via `[locale]` dynamic segment (`es` / `en`). 
Root `app/page.tsx` redirects to `/es`.

### Data flow
```
app/[locale]/page.tsx  (Server Component)
  → getDictionary(locale)          lib/getDictionary.ts → dictionaries/{es,en}.json
  → <SimulatorPage dict locale />  components/SimulatorPage.tsx (all state lives here)
      → simulateCoffee(method, inputs)   engine/simulationEngine.ts
           → simulateEspresso(inputs)    engine/espressoEngine.ts
           → simulateV60(inputs)         engine/v60Engine.ts
           → (rest of engines pending)
      → <SimulatorHero />          header, method selector, recipe name/save/copy
      → <SimulatorResultPanel />   extraction result, FlavorRadar, ExtractionMap, HybridRadarMap
      → <SimulatorControlsPanel /> renders method-specific controls component
```

### Engine (`engine/`)
- **`espressoEngine.ts`** — espresso physics. Computes extraction (0–100), shot time, state, styleHint, FlavorAxes.
- **`v60Engine.ts`** — V60 physics. bloomTimeS is internal = totalTimeS * 0.15, not exposed to UI.
- **`simulationEngine.ts`** — dispatcher by BrewMethod. Each case must use its specific engine.

### Key types (`components/types/`)
- **`brew.ts`** — `BrewMethod` union type
- **`recipe.ts`** — `SavedRecipe` with method-specific params structure (single source of truth)
- **`engines.ts`** — all engine input/output types

## Closed Architecture Decisions

### Type system
Use `CommonCoffeeParams` as base for all method types:
```typescript
type CommonCoffeeParams = {
  roast: Roast;
  process: Process;
};

type EspressoParams = CommonCoffeeParams & {
  method: "espresso";
  grind: number;
  ratio: number;          // 1.0–3.2
  temperatureC?: number;  // advanced only
  pressureBar?: number;   // advanced only
  waterGH?: number;       // advanced only
  waterKH?: number;       // advanced only
};

type V60Params = CommonCoffeeParams & {
  method: "v60";
  grind: number;
  ratio: number;          // 10–20
  temperatureC: number;   // 90–96°C
  totalTimeS: number;     // 120–300s
  waterGH?: number;       // advanced only
  waterKH?: number;       // advanced only
  // bloomTimeS is internal: totalTimeS * 0.15
};

type FrenchPressParams = CommonCoffeeParams & {
  method: "french_press";
  grind: number;
  ratio: number;          // 10–18
  totalTimeS: number;
  waterGH?: number;       // advanced only
  waterKH?: number;       // advanced only
  temperatureC?: number;  // advanced only
};

type AeropressParams = CommonCoffeeParams & {
  method: "aeropress";
  grind: number;
  ratio: number;          // 6–15
  temperatureC: number;
  totalTimeS: number;
  waterGH?: number;       // advanced only
  waterKH?: number;       // advanced only
  pressureLevel?: number; // advanced only (1–5 intensity)
  inverted?: boolean;     // advanced only
};

type MokaParams = CommonCoffeeParams & {
  method: "moka";
  grind: number;
  ratio: number;          // 5–10
  heatLevel: number;      // 1–5 (replaces temperature for moka)
  waterGH?: number;       // advanced only
  waterKH?: number;       // advanced only
  waterTempC?: number;    // advanced only (preheated water)
};

type ColdBrewParams = CommonCoffeeParams & {
  method: "cold_brew";
  grind: number;
  ratio: number;          // 4–10
  totalTimeH: number;     // hours (8–24)
  waterGH?: number;       // advanced only
  waterKH?: number;       // advanced only
  fridgeTempC?: number;   // advanced only
};
```

### Advanced mode — ALL methods have it
- **Espresso** basic: grind, ratio / advanced: temperature, pressure, water
- **V60** basic: grind, ratio, temperature, time / advanced: water
- **French Press** basic: grind, ratio, time / advanced: water, temperature
- **AeroPress** basic: grind, ratio, temperature, time / advanced: water, pressure intensity, inverted
- **Moka** basic: grind, ratio, heat level / advanced: water, initial water temp
- **Cold Brew** basic: grind, ratio, time / advanced: water, fridge temperature
- Water GH/KH is the common advanced parameter across all methods

### SimulatorPage state
Refactor to `useReducer` — do not add more `useState`. 
The `method` must be persisted in URL params alongside other params.

### SavedRecipe
Defined only in `components/types/recipe.ts`. Never duplicated.
Structure uses method-specific params union:
```typescript
type SavedRecipe = {
  id: string;
  name: string;
  locale: "es" | "en";
  method: BrewMethod;
  params: EspressoParams | V60Params | FrenchPressParams | AeropressParams | MokaParams | ColdBrewParams;
  createdAt: string;
};
```

### Controls components — one per method
Each method has its own controls component:
```
components/
  controls/
    EspressoControls.tsx
    V60Controls.tsx
    FrenchPressControls.tsx
    AeropressControls.tsx
    MokaControls.tsx
    ColdBrewControls.tsx
```
`SimulatorControlsPanel` renders the active method's component.

### Visualizations — shared across all methods
- `FlavorRadar`, `ExtractionMap`, `HybridRadarMap` are shared.
- `HybridRadarMap` receives `ratioRange: [min, max]` prop to recalibrate 
  the extraction map point for each method's ratio scale.

### Engine pattern — follow this exactly
```typescript
// Each engine exports:
export type MethodInputs = CommonCoffeeParams & { method: "method_name"; ...params }
export type MethodResult = {
  extraction: number;        // 0–100
  estimatedTimeS: number;
  state: "Subextraído" | "Balanceado" | "Sobreextraído";
  axes: FlavorAxes;
  beverageG: number;
  // styleHint only for espresso
}
export function simulateMethod(input: MethodInputs): MethodResult { ... }
// Pure functions only — no side effects
// Internal calculations only — no UI logic
```

### Common fixed values
- `roast` and `process` are always visible in all methods (not advanced)
- `doseG` is fixed at 18g for espresso, varies by method otherwise

## Roadmap — implementation order
1. ✅ espressoEngine.ts
2. ✅ v60Engine.ts (needs review: remove bloomTimeS from inputs, keep internal)
3. Refactor SimulatorPage to useReducer + persist method in URL
4. Move SavedRecipe to components/types/recipe.ts
5. Create components/types/engines.ts with all type definitions
6. Create EspressoControls.tsx and V60Controls.tsx
7. FrenchPressEngine.ts + FrenchPressControls.tsx
8. AeropressEngine.ts + AeropressControls.tsx
9. MokaEngine.ts + MokaControls.tsx
10. ColdBrewEngine.ts + ColdBrewControls.tsx

## Known technical debt
- V60Engine.ts currently has bloomTimeS in inputs — must be moved to internal
- V60Engine.ts currently has waterGH/waterKH — keep them (advanced params)
- SimulatorPage.tsx has many useState — pending refactor to reducer (step 3)
- method not yet persisted in URL params (step 3)
- HybridRadarMap needs ratioRange prop (pending)