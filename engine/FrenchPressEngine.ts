import type { Roast, Process, FlavorAxes } from "./espressoEngine";

export type FrenchPressInputs = {
  grind: number;        // 0-100 (coarser than espresso, typical 40)
  ratio: number;        // water:coffee ratio, 10-18 (typical 14)
  doseG: number;        // coffee dose in grams
  temperatureC: number; // 80-96°C (default 93)
  totalTimeS: number;   // total brew time in seconds (120-360, default 240)
  roast: Roast;
  process: Process;
  waterGH?: number;
  waterKH?: number;
};

export type FrenchPressResult = {
  extraction: number;
  estimatedTimeS: number;
  state: "Subextraído" | "Balanceado" | "Sobreextraído";
  beverageG: number;
  axes: FlavorAxes;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function bell(x: number, center: number, width: number) {
  const z = (x - center) / width;
  return Math.exp(-(z * z));
}

function computeFrenchPressExtraction(
  grind: number,
  ratio: number,
  temperatureC: number,
  totalTimeS: number
): number {
  const grindN = grind / 100;
  const ratioN = (ratio - 10) / 8;
  const tempN = (temperatureC - 80) / 15;
  const timeN = Math.min(totalTimeS / 300, 1);

  return clamp(
    10 +
    grindN * 28 +
    ratioN * 20 +
    tempN * 8 +
    timeN * 14
  );
}

function getExtractionState(
  extraction: number,
  roast: Roast
): FrenchPressResult["state"] {
  const low = 38;
  const high = roast === "claro" ? 70 : roast === "oscuro" ? 60 : 65;

  if (extraction < low) return "Subextraído";
  if (extraction > high) return "Sobreextraído";
  return "Balanceado";
}

function computeFrenchPressSensoryProfile(
  extraction: number,
  grind: number,
  ratio: number,
  roast: Roast,
  process: Process,
  temperatureC: number,
  waterGH: number,
  waterKH: number
): FlavorAxes {
  const ratioN = (ratio - 10) / 8;
  const tempN = (temperatureC - 80) / 15;

  let acidityBias = 0;
  let bitternessBias = 0;
  let bodyBias = 0;
  let astringencyBias = 0;
  let sweetnessBias = 0;

  if (roast === "claro") {
    acidityBias += 10;
    sweetnessBias -= 2;
    astringencyBias += 2;
  } else if (roast === "medio") {
    sweetnessBias += 4;
    bodyBias += 2;
  } else if (roast === "oscuro") {
    bitternessBias += 10;
    bodyBias += 4;
    acidityBias -= 8;
    astringencyBias += 5;
  }

  if (process === "natural") {
    sweetnessBias += 6;
    acidityBias += 2;
    astringencyBias -= 2;
  } else if (process === "honey") {
    sweetnessBias += 4;
    bodyBias += 2;
  } else if (process === "lavado") {
    acidityBias += 5;
    astringencyBias += 1;
  }

  const E = extraction;
  const ghN = (waterGH - 1) / 11;
  const khN = waterKH / 8;
  const waterBodyBias = (ghN - 0.5) * 6;
  const waterSweetnessBias = (ghN - 0.5) * 5;
  const waterAcidityBias = -(khN * 8);
  const grindN = grind / 100;
  const tempAcidityBias = (0.5 - tempN) * 8;
  const tempBitternessBias = (tempN - 0.5) * 6;

  // French Press: full immersion, no paper filter — very high body, lower acidity
  const ratioBodyBias = (0.5 - ratioN) * 18;
  const body = clamp(
    35 + E * 0.50 + ratioBodyBias + bodyBias + waterBodyBias
  );

  const acidity = clamp(
    60 - E * 0.60 + acidityBias + tempAcidityBias + waterAcidityBias
  );

  const bitterness = clamp(
    (E - 50) * 0.85 + 20 + bitternessBias + tempBitternessBias
  );

const grindAstringency = (1 - grindN) * 8;

const astringency = clamp(
  (E - 55) * 0.75 + 12 + astringencyBias + grindAstringency
);

  // French Press sweetness peaks around E=48
  const sweetnessBase = 15 + 55 * bell(E, 48, 16);
  const ratioSweetnessBias = (0.5 - ratioN) * 8;

  const sweetness = clamp(
    sweetnessBase + sweetnessBias + ratioSweetnessBias + waterSweetnessBias
  );

  return {
    acidez: Math.round(acidity),
    dulzor: Math.round(sweetness),
    amargor: Math.round(bitterness),
    astringencia: Math.round(astringency),
    cuerpo: Math.round(body),
  };
}

export function simulateFrenchPress(input: FrenchPressInputs): FrenchPressResult {
  const grind = clamp(input.grind, 0, 100);
  const ratio = clamp(input.ratio, 10, 18);
  const doseG = Math.max(1, input.doseG);
  const temperatureC = clamp(input.temperatureC, 80, 96);
  const totalTimeS = Math.max(60, input.totalTimeS);
  const waterGH = clamp(input.waterGH ?? 6, 1, 12);
  const waterKH = clamp(input.waterKH ?? 3, 0, 8);

  const extraction = computeFrenchPressExtraction(
    grind,
    ratio,
    temperatureC,
    totalTimeS
  );

  const state = getExtractionState(extraction, input.roast);

  const axes = computeFrenchPressSensoryProfile(
    extraction,
    grind,
    ratio,
    input.roast,
    input.process,
    temperatureC,
    waterGH,
    waterKH
  );

  const beverageG = Math.round(doseG * ratio);

  return {
    extraction,
    estimatedTimeS: totalTimeS,
    state,
    beverageG,
    axes,
  };
}
