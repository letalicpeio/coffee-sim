import type { Roast, Process, FlavorAxes } from "./espressoEngine";

export type MokaInputs = {
  grind: number;        // 0-100, típico 80 (más fino que V60, menos que espresso)
  ratio: number;        // 5-10 agua:café, típico 7
  doseG: number;
  heatLevel: number;    // 1-5 intensidad calor, típico 3
  roast: Roast;
  process: Process;
  waterGH?: number;
  waterKH?: number;
  waterTempC?: number;  // opcional avanzado: agua precalentada 40-95°C, default 20 (fría)
};

export type MokaResult = {
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

function computeMokaExtraction(
  grind: number,
  ratio: number,
  heatLevel: number,
  waterTempC: number
): number {
  const grindN = grind / 100;
  const ratioN = (ratio - 5) / 5;
  const heatN = (heatLevel - 1) / 4;
  const waterTempN = clamp((waterTempC - 20) / 75, 0, 1);

  return clamp(
    15 +
    grindN * 35 +
    ratioN * 18 +
    heatN * 12 +
    waterTempN * 8
  );
}

function getExtractionState(
  extraction: number,
  roast: Roast
): MokaResult["state"] {
  const low = 42;
  const high = roast === "claro" ? 74 : roast === "oscuro" ? 65 : 70;

  if (extraction < low) return "Subextraído";
  if (extraction > high) return "Sobreextraído";
  return "Balanceado";
}

function computeMokaSensoryProfile(
  extraction: number,
  ratio: number,
  roast: Roast,
  process: Process,
  heatLevel: number,
  waterGH: number,
  waterKH: number
): FlavorAxes {
  const ratioN = (ratio - 5) / 5;
  const heatN = (heatLevel - 1) / 4;

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
    72 - E * 0.7 + acidityBias + (0.5 - heatN) * 6 + waterAcidityBias
  );
  const bitterness = clamp(
    (E - 48) * 1.0 + 22 + bitternessBias + (heatN - 0.5) * 8
  );
  const astringency = clamp(
    (E - 52) * 0.9 + 14 + astringencyBias + (heatN - 0.5) * 5
  );

  const sweetnessBase = 15 + 52 * bell(E, 52, 15);
  const ratioSweetBias = (0.5 - ratioN) * 8;
  const sweetness = clamp(
    sweetnessBase + sweetnessBias + ratioSweetBias + waterSweetnessBias
  );

  const ratioBodyBias = (0.5 - ratioN) * 16;
  const body = clamp(
    28 + E * 0.42 + ratioBodyBias + bodyBias + waterBodyBias
  );

  return {
    acidez: Math.round(acidity),
    dulzor: Math.round(sweetness),
    amargor: Math.round(bitterness),
    astringencia: Math.round(astringency),
    cuerpo: Math.round(body),
  };
}

export function simulateMoka(input: MokaInputs): MokaResult {
  const grind = clamp(input.grind, 0, 100);
  const ratio = clamp(input.ratio, 5, 10);
  const doseG = Math.max(1, input.doseG);
  const heatLevel = Math.max(1, Math.min(5, input.heatLevel));
  const waterTempC = input.waterTempC !== undefined ? clamp(input.waterTempC, 20, 95) : 20;
  const waterGH = clamp(input.waterGH ?? 6, 1, 12);
  const waterKH = clamp(input.waterKH ?? 3, 0, 8);

  const extraction = computeMokaExtraction(grind, ratio, heatLevel, waterTempC);
  const state = getExtractionState(extraction, input.roast);
  const axes = computeMokaSensoryProfile(
    extraction,
    ratio,
    input.roast,
    input.process,
    heatLevel,
    waterGH,
    waterKH
  );
  const beverageG = Math.round(doseG * ratio);
  const estimatedTimeS = Math.round(300 - heatLevel * 40);

  return { extraction, estimatedTimeS, state, beverageG, axes };
}
