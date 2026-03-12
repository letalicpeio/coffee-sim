import type { Roast, Process, FlavorAxes } from "./espressoEngine";

export type AeropressInputs = {
  grind: number;         // 0-100, típico 65
  ratio: number;         // 6-15 agua:café, típico 8
  doseG: number;
  temperatureC: number;  // 80-96°C, típico 88
  totalTimeS: number;    // 30-120s, típico 90
  roast: Roast;
  process: Process;
  waterGH?: number;
  waterKH?: number;
  pressureLevel?: number; // 1-5, típico 3
  inverted?: boolean;     // default false
};

export type AeropressResult = {
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

function computeAeropressExtraction(
  grind: number,
  ratio: number,
  temperatureC: number,
  totalTimeS: number,
  pressureLevel: number,
  inverted: boolean
): number {
  const grindN = grind / 100;
  const ratioN = (ratio - 6) / 9;
  const tempN = (temperatureC - 80) / 16;
  const timeN = Math.min(totalTimeS / 120, 1);
  const pressureN = (pressureLevel - 1) / 4;
  const invertedBonus = inverted ? 5 : 0;

  return clamp(
    8 +
    grindN * 32 +
    ratioN * 15 +
    tempN * 12 +
    timeN * 10 +
    pressureN * 8 +
    invertedBonus
  );
}

function getExtractionState(
  extraction: number,
  roast: Roast
): AeropressResult["state"] {
  const low = 38;
  const high = roast === "claro" ? 70 : roast === "oscuro" ? 60 : 65;

  if (extraction < low) return "Subextraído";
  if (extraction > high) return "Sobreextraído";
  return "Balanceado";
}

function computeAeropressSensoryProfile(
  extraction: number,
  ratio: number,
  roast: Roast,
  process: Process,
  temperatureC: number,
  pressureLevel: number,
  inverted: boolean,
  waterGH: number,
  waterKH: number
): FlavorAxes {
  const ratioN = (ratio - 6) / 9;
  const tempN = (temperatureC - 80) / 16;
  const pressureN = (pressureLevel - 1) / 4;

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

  const acidity = clamp(
    78 - E * 0.72 + acidityBias + (0.5 - tempN) * 9 + waterAcidityBias
  );

  const bitterness = clamp(
    (E - 50) * 0.95 + 18 + bitternessBias + (tempN - 0.5) * 8 + pressureN * 6
  );

  const astringency = clamp(
    (E - 55) * 0.8 + 10 + astringencyBias
  );

  const sweetnessBase = 15 + 55 * bell(E, 50, 16);
  const bloomSweetBonus = inverted ? 5 : 0;
  const ratioSweetBias = (0.5 - ratioN) * 8;
  const sweetness = clamp(
    sweetnessBase + sweetnessBias + bloomSweetBonus + ratioSweetBias + waterSweetnessBias
  );

  const ratioBodyBias = (0.5 - ratioN) * 15;
  const pressureBodyBias = (pressureN - 0.5) * 12;
  const body = clamp(
    18 + E * 0.38 + ratioBodyBias + pressureBodyBias + bodyBias + waterBodyBias
  );

  return {
    acidez: Math.round(acidity),
    dulzor: Math.round(sweetness),
    amargor: Math.round(bitterness),
    astringencia: Math.round(astringency),
    cuerpo: Math.round(body),
  };
}

export function simulateAeropress(input: AeropressInputs): AeropressResult {
  const grind = clamp(input.grind, 0, 100);
  const ratio = clamp(input.ratio, 6, 15);
  const doseG = Math.max(1, input.doseG);
  const temperatureC = clamp(input.temperatureC, 80, 96);
  const totalTimeS = clamp(input.totalTimeS, 30, 120);
  const pressureLevel = Math.max(1, Math.min(5, input.pressureLevel ?? 3));
  const inverted = input.inverted ?? false;
  const waterGH = clamp(input.waterGH ?? 6, 1, 12);
  const waterKH = clamp(input.waterKH ?? 3, 0, 8);

  const extraction = computeAeropressExtraction(
    grind,
    ratio,
    temperatureC,
    totalTimeS,
    pressureLevel,
    inverted
  );

  const state = getExtractionState(extraction, input.roast);

  const axes = computeAeropressSensoryProfile(
    extraction,
    ratio,
    input.roast,
    input.process,
    temperatureC,
    pressureLevel,
    inverted,
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
