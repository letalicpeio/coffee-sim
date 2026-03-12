import type { Roast, Process, FlavorAxes } from "./espressoEngine";

export type V60Inputs = {
  grind: number;        // 0-100 (coarser than espresso, typical 60-80)
  ratio: number;        // water:coffee ratio, 10-20 (typical 15)
  doseG: number;        // coffee dose in grams
  temperatureC: number; // 90-96°C
  totalTimeS: number;   // total brew time in seconds (120-300)
  // bloomTimeS is internal: totalTimeS * 0.15
  roast: Roast;
  process: Process;
  waterGH?: number;
  waterKH?: number;
};

export type V60Result = {
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

function computeV60Extraction(
  grind: number,
  ratio: number,
  temperatureC: number,
  totalTimeS: number,
  bloomTimeS: number
): number {
  const grindN = grind / 100;
  const ratioN = (ratio - 10) / 10;
  const tempN = (temperatureC - 90) / 6;
  const timeN = Math.min(totalTimeS / 300, 1);
  const bloomN = bloomTimeS / Math.max(totalTimeS, 1);

  return clamp(
    8 +
    grindN * 30 +
    ratioN * 18 +
    tempN * 10 +
    timeN * 12 +
    bloomN * 4
  );
}

function getExtractionState(
  extraction: number,
  roast: Roast
): V60Result["state"] {
  const low = 38;
  const high = roast === "claro" ? 70 : roast === "oscuro" ? 60 : 65;

  if (extraction < low) return "Subextraído";
  if (extraction > high) return "Sobreextraído";
  return "Balanceado";
}

function computeV60SensoryProfile(
  extraction: number,
  ratio: number,
  roast: Roast,
  process: Process,
  temperatureC: number,
  totalTimeS: number,
  bloomTimeS: number,
  waterGH: number,
  waterKH: number
): FlavorAxes {
  const ratioN = (ratio - 10) / 10;
  const tempN = (temperatureC - 90) / 6;
  const bloomN = bloomTimeS / Math.max(totalTimeS, 1);

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

  const tempAcidityBias = (0.5 - tempN) * 10;
  const tempBitternessBias = (tempN - 0.5) * 8;

  const acidity = clamp(
    80 - E * 0.75 + acidityBias + tempAcidityBias + waterAcidityBias
  );
  const bitterness = clamp(
    (E - 50) * 0.9 + 18 + bitternessBias + tempBitternessBias
  );
  const astringency = clamp(
    (E - 55) * 0.8 + 10 + astringencyBias
  );

  // Pour-over sweetness peaks around E=50; bloom improves sweetness
  const sweetnessBase = 15 + 55 * bell(E, 50, 15);
  const bloomSweetnessBias = bloomN * 10;
  const ratioSweetnessBias = (0.5 - ratioN) * 8;

  const sweetness = clamp(
    sweetnessBase + sweetnessBias + bloomSweetnessBias + ratioSweetnessBias + waterSweetnessBias
  );

  // V60 body is lighter than espresso (no pressure); lower ratio = more body
  const ratioBodyBias = (0.5 - ratioN) * 20;
  const body = clamp(
    15 + E * 0.35 + ratioBodyBias + bodyBias + waterBodyBias
  );

  return {
    acidez: Math.round(acidity),
    dulzor: Math.round(sweetness),
    amargor: Math.round(bitterness),
    astringencia: Math.round(astringency),
    cuerpo: Math.round(body),
  };
}

export function simulateV60(input: V60Inputs): V60Result {
  const grind = clamp(input.grind, 0, 100);
  const ratio = clamp(input.ratio, 10, 20);
  const doseG = Math.max(1, input.doseG);
  const temperatureC = clamp(input.temperatureC, 90, 96);
  const totalTimeS = Math.max(60, input.totalTimeS);
  const bloomTimeS = totalTimeS * 0.15; // interno: 15% del tiempo total
  const waterGH = clamp(input.waterGH ?? 6, 1, 12);
  const waterKH = clamp(input.waterKH ?? 3, 0, 8);

  const extraction = computeV60Extraction(
    grind,
    ratio,
    temperatureC,
    totalTimeS,
    bloomTimeS
  );

  const state = getExtractionState(extraction, input.roast);

  const axes = computeV60SensoryProfile(
    extraction,
    ratio,
    input.roast,
    input.process,
    temperatureC,
    totalTimeS,
    bloomTimeS,
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
