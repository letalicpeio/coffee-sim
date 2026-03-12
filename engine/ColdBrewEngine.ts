import type { Roast, Process, FlavorAxes } from "./espressoEngine";

export type ColdBrewInputs = {
  grind: number;          // 0-100, grueso típico 30-60
  ratio: number;          // 4-10 (agua g / café g)
  totalTimeH: number;     // 8-24 horas
  roast: Roast;
  process: Process;
  waterGH?: number;
  waterKH?: number;
  fridgeTempC?: number;   // 2-8°C, default 4
};

export type ColdBrewResult = {
  extraction: number;        // 0-100
  estimatedTimeS: number;    // totalTimeH * 3600
  state: "Subextraído" | "Balanceado" | "Sobreextraído";
  beverageG: number;         // ratio * 10 (asume 10g café base)
  axes: FlavorAxes;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function computeExtraction(
  grind: number,
  ratio: number,
  totalTimeH: number,
  fridgeTempC: number,
  waterGH: number
): number {
  const grindN = grind / 100;
  const ratioN = (ratio - 4) / 6;
  const timeN = (totalTimeH - 8) / 16;
  const tempN = (fridgeTempC - 2) / 6;
  const waterN = Math.min(waterGH / 12, 1);

  const extraction =
    5 +
    grindN * 25 +
    ratioN * 20 +
    timeN * 18 +
    tempN * 8 +
    waterN * 5;

  return clamp(extraction);
}

function getExtractionState(
  extraction: number,
  roast: Roast
): ColdBrewResult["state"] {
  const threshold = roast === "claro" ? 50 : roast === "medio" ? 60 : 55;

  if (extraction < 35) return "Subextraído";
  if (extraction < threshold) return "Balanceado";
  return "Sobreextraído";
}

function computeFlavorAxes(
  extraction: number,
  ratio: number,
  roast: Roast,
  process: Process
): FlavorAxes {
  const ratioN = (ratio - 4) / 6;

  const acidez =
    roast === "claro" ? 30 : roast === "medio" ? 15 : 8;

  const dulzor = clamp(
    Math.min(100, 45 + extraction * 0.4) + (process === "natural" ? 10 : 0)
  );

  const amargor = clamp(Math.max(0, extraction * 0.2 - 5));

  const astringencia = clamp(Math.max(0, extraction * 0.1));

  const cuerpo = clamp(40 + ratioN * 20);

  return {
    acidez: Math.round(acidez),
    dulzor: Math.round(dulzor),
    amargor: Math.round(amargor),
    astringencia: Math.round(astringencia),
    cuerpo: Math.round(cuerpo),
  };
}

export function simulateColdBrew(input: ColdBrewInputs): ColdBrewResult {
  const grind = clamp(input.grind, 0, 100);
  const ratio = Math.max(4, Math.min(10, input.ratio));
  const totalTimeH = Math.max(8, Math.min(24, input.totalTimeH));
  const fridgeTempC = Math.max(2, Math.min(8, input.fridgeTempC ?? 4));
  const waterGH = Math.max(0, input.waterGH ?? 6);

  const extraction = computeExtraction(grind, ratio, totalTimeH, fridgeTempC, waterGH);
  const estimatedTimeS = totalTimeH * 3600;
  const state = getExtractionState(extraction, input.roast);
  const beverageG = ratio * 10;
  const axes = computeFlavorAxes(extraction, ratio, input.roast, input.process);

  return {
    extraction,
    estimatedTimeS,
    state,
    beverageG,
    axes,
  };
}
