# Coffee-Sim

Interactive coffee extraction simulator.

---

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

There are no automated tests in this project.

---

## Language

Always respond in Spanish.

---

## Stack

Next.js  
TypeScript  
TailwindCSS  

No backend.

---

## Documentation

Detailed documentation is located in `/docs`.

Important documents:

- docs/ai-entrypoint.md
- docs/architecture.md
- docs/simulation-model.md
- docs/engine-contract.md
- docs/method-registry.md
- docs/dev-llm-workflow.md

AI agents should consult these documents before exploring the repository.

---

## Architecture

**coffee-sim** is a Next.js + React + Tailwind CSS coffee simulator.

The application uses:

- App Router
- i18n via `[locale]` dynamic segment (`es` / `en`)
- root `app/page.tsx` redirects to `/es`

Main architecture layers:

UI components → `/components`  
Simulation engine → `/engine`  
Pages → `/app`

The simulation engine is pure logic and must remain independent from the UI.

---

### Data Flow

```
app/[locale]/page.tsx (Server Component)
  → getDictionary(locale) → dictionaries/{es,en}.json
  → <SimulatorPage dict locale />
       → simulateCoffee(method, inputs) → engine/simulationEngine.ts
            → simulateEspresso(inputs)
            → simulateV60(inputs)
            → simulateFrenchPress(inputs)
            → simulateAeropress(inputs)
            → simulateMoka(inputs)
            → simulateColdBrew(inputs)
       → <SimulatorHero />
       → <SimulatorResultPanel />
       → <SimulatorControlsPanel />
```

All simulator state lives inside **SimulatorPage.tsx**.

---

### Engine (/engine)

Each brewing method has its own simulation engine.

Engines perform all brewing calculations and must remain independent from the UI.

Engines must:

- be pure functions
- have no side effects
- contain no React code
- contain no UI logic

Dispatcher logic lives in:

```
engine/simulationEngine.ts
```

---

### Key Types (components/types/)

Important files:

- `brew.ts` — `BrewMethod` union type
- `recipe.ts` — `SavedRecipe` (single source of truth)
- `engines.ts` — engine input/output types

`SavedRecipe` must never be duplicated elsewhere in the codebase.

---

## Closed Architecture Decisions

### Type system

Use `CommonCoffeeParams` as base for all method types.

```ts
type CommonCoffeeParams = {
  roast: Roast
  process: Process
}
```

Each brewing method extends this base with method-specific parameters.

```ts
type EspressoParams = CommonCoffeeParams & {
  method: "espresso"
  grind: number
  ratio: number
  temperatureC?: number
  pressureBar?: number
  waterGH?: number
  waterKH?: number
}

type V60Params = CommonCoffeeParams & {
  method: "v60"
  grind: number
  ratio: number
  temperatureC: number
  totalTimeS: number
  waterGH?: number
  waterKH?: number
}

type FrenchPressParams = CommonCoffeeParams & {
  method: "french_press"
  grind: number
  ratio: number
  totalTimeS: number
  waterGH?: number
  waterKH?: number
  temperatureC?: number
}

type AeropressParams = CommonCoffeeParams & {
  method: "aeropress"
  grind: number
  ratio: number
  temperatureC: number
  totalTimeS: number
  waterGH?: number
  waterKH?: number
  pressureLevel?: number
  inverted?: boolean
}

type MokaParams = CommonCoffeeParams & {
  method: "moka"
  grind: number
  ratio: number
  heatLevel: number
  waterGH?: number
  waterKH?: number
  waterTempC?: number
}

type ColdBrewParams = CommonCoffeeParams & {
  method: "cold_brew"
  grind: number
  ratio: number
  totalTimeH: number
  waterGH?: number
  waterKH?: number
  fridgeTempC?: number
}
```

---

### Advanced mode — ALL methods have it

All brewing methods support advanced parameters.

Common advanced parameters across methods:

- waterGH
- waterKH

Additional advanced parameters depend on the brewing method.

Examples:

Espresso  
temperature, pressure

V60  
water composition

French Press  
water composition, temperature

AeroPress  
pressure intensity, inverted method

Moka  
heat level, initial water temperature

Cold Brew  
fridge temperature

---

### SimulatorPage state

All simulator state is managed inside `SimulatorPage.tsx`.

State management uses:

```
useReducer
```

Do not introduce additional `useState` for brewing parameters.

The active brewing method must be persisted in URL parameters.

---

### SavedRecipe

Defined only in `components/types/recipe.ts`.

```ts
type SavedRecipe = {
  id: string
  name: string
  locale: "es" | "en"
  method: BrewMethod
  params: EspressoParams | V60Params | FrenchPressParams | AeropressParams | MokaParams | ColdBrewParams
  createdAt: string
}
```

---

### Controls components — one per method

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

---

### Visualizations — shared across all methods

Shared components:

- `FlavorRadar`
- `ExtractionMap`
- `HybridRadarMap`

`HybridRadarMap` receives a `ratioRange: [min, max]` prop to adapt extraction maps for each method.

---

### Engine pattern — follow this exactly

```ts
export type MethodInputs = CommonCoffeeParams & { method: "method_name"; ...params }

export type MethodResult = {
  extraction: number
  estimatedTimeS: number
  state: "Subextraído" | "Balanceado" | "Sobreextraído"
  axes: FlavorAxes
  beverageG: number
}

export function simulateMethod(input: MethodInputs): MethodResult
```

Rules:

- engines must be pure functions
- no UI imports
- no side effects
- calculations only

---

### Common fixed values

- `roast` and `process` are always visible in all methods
- `doseG` is fixed at **18g for espresso**

---

## Coding Rules

- Keep functions small and focused
- Prefer explicit logic over complex abstractions
- Avoid unnecessary dependencies
- Maintain strong TypeScript typing

---

## Documentation Rules

All exported functions should include **JSDoc comments**.

Complex logic should include inline comments explaining **why the logic exists**, not only what it does.

---

## Important Files

Core simulation:

- `engine/simulationEngine.ts`
- `engine/espressoEngine.ts`

Main UI orchestrator:

- `components/SimulatorPage.tsx`

Visualisation:

- `components/HybridRadarMap.tsx`
