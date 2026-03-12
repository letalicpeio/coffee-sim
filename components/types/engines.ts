import type { Roast, Process, FlavorAxes } from "../../engine/espressoEngine";

export type { Roast, Process, FlavorAxes };

// ─── Base común ───────────────────────────────────────────────────────────────

export type CommonCoffeeParams = {
  roast: Roast;
  process: Process;
};

// ─── Params por método ────────────────────────────────────────────────────────

export type EspressoParams = CommonCoffeeParams & {
  method: "espresso";
  grind: number;
  ratio: number;         // 1.0–3.2
  temperatureC?: number; // avanzado
  pressureBar?: number;  // avanzado
  waterGH?: number;      // avanzado
  waterKH?: number;      // avanzado
};

export type V60Params = CommonCoffeeParams & {
  method: "v60";
  grind: number;
  ratio: number;         // 10–20
  temperatureC: number;  // 90–96°C (básico)
  totalTimeS: number;    // 120–300s (básico)
  waterGH?: number;      // avanzado
  waterKH?: number;      // avanzado
  // bloomTimeS es interno: totalTimeS * 0.15
};

export type FrenchPressParams = CommonCoffeeParams & {
  method: "french_press";
  grind: number;
  ratio: number;         // 10–18
  totalTimeS: number;
  waterGH?: number;      // avanzado
  waterKH?: number;      // avanzado
  temperatureC?: number; // avanzado
};

export type AeropressParams = CommonCoffeeParams & {
  method: "aeropress";
  grind: number;
  ratio: number;          // 6–15
  temperatureC: number;
  totalTimeS: number;
  waterGH?: number;       // avanzado
  waterKH?: number;       // avanzado
  pressureLevel?: number; // avanzado (1–5)
  inverted?: boolean;     // avanzado
};

export type MokaParams = CommonCoffeeParams & {
  method: "moka";
  grind: number;
  ratio: number;        // 5–10
  heatLevel: number;    // 1–5
  waterGH?: number;     // avanzado
  waterKH?: number;     // avanzado
  waterTempC?: number;  // avanzado
};

export type ColdBrewParams = CommonCoffeeParams & {
  method: "cold_brew";
  grind: number;
  ratio: number;         // 4–10
  totalTimeH: number;    // 8–24h
  waterGH?: number;      // avanzado
  waterKH?: number;      // avanzado
  fridgeTempC?: number;  // avanzado
};

export type MethodParams =
  | EspressoParams
  | V60Params
  | FrenchPressParams
  | AeropressParams
  | MokaParams
  | ColdBrewParams;

// ─── Resultados del motor ─────────────────────────────────────────────────────

export type MethodResult = {
  extraction: number;
  estimatedTimeS: number;
  state: "Subextraído" | "Balanceado" | "Sobreextraído";
  beverageG: number;
  axes: FlavorAxes;
  styleHint?: "Ristretto" | "Espresso" | "Lungo"; // solo espresso
};
