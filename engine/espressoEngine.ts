export type Roast = "claro" | "medio" | "oscuro";
export type Process = "lavado" | "natural" | "honey";

export type EspressoInputs = {
  // 0..100 (0 = muy grueso, 100 = muy fino)
  grind: number;
  // ratio 1:x (p.ej 2.0 significa 1:2)
  ratio: number;
  // dosis en gramos (solo para mostrar 18g -> 36g)
  doseG: number;
  temperatureC?: number;
  pressureBar?: number;
  waterGH?: number;
  waterKH?: number;
  roast: Roast;
  process: Process;

};

export type FlavorAxes = {
  acidez: number;       // 0..100
  dulzor: number;       // 0..100
  amargor: number;      // 0..100
  astringencia: number; // 0..100
  cuerpo: number;       // 0..100
};

export type EspressoResult = {
  extraction: number; // 0..100
  estimatedTimeS: number;
  state: "Subextraído" | "Balanceado" | "Sobreextraído";
  styleHint: "Ristretto" | "Espresso" | "Lungo";
  beverageG: number; // doseG * ratio
  axes: FlavorAxes;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

// Curva “campana” simple (pico en center, cae hacia los lados)
function bell(x: number, center: number, width: number) {
  const z = (x - center) / width;
  return Math.exp(-(z * z));
}

function computeExtraction(
  grind: number,
  ratio: number,
  temperatureC: number,
  pressureBar: number
) {
  const grindN = grind / 100;
  const ratioN = (ratio - 1.0) / (3.2 - 1.0);

  const grindContribution = grindN * 55;
  const ratioContribution = ratioN * 35;
  const interactionContribution = grindN * ratioN * 20;
  const temperatureN = (temperatureC - 88) / (98 - 88);
  const temperatureContribution = (temperatureN - 0.5) * 10;
  const pressureN = (pressureBar - 6) / (10 - 6);
  const pressureContribution = (pressureN - 0.5) * 8;

  let extraction =
    12 +
    grindContribution +
    ratioContribution +
    interactionContribution +
    temperatureContribution +
    pressureContribution;

  return clamp(extraction);
}

function computeShotTime(grind: number, ratio: number, roast: Roast) {
  const grindN = grind / 100;
  const ratioN = (ratio - 1.0) / (3.2 - 1.0);

  // Base orientativa de espresso
  const baseTime = 18;

  // Más fino = más resistencia = más tiempo
  const grindContribution = grindN * 14;

  // Más ratio = más bebida = algo más de tiempo
  const ratioContribution = ratioN * 8;

  let roastTimeBias = 0;

  if (roast === "claro") {
    roastTimeBias = 2;
  } else if (roast === "oscuro") {
    roastTimeBias = -2;
  }

  const estimatedTimeS =
    baseTime + grindContribution + ratioContribution + roastTimeBias;

  return Math.round(estimatedTimeS);
}

function getTimeExtractionAdjustment(timeS: number) {
  if (timeS < 22) return -6;
  if (timeS < 26) return -3;
  if (timeS <= 32) return 0;
  if (timeS <= 36) return 3;
  return 6;
}

function getExtractionState(
  extraction: number,
  roast: Roast
): EspressoResult["state"] {
  let low = 40;
  let high = 68;

  if (roast === "claro") {
    high = 72;
  } else if (roast === "oscuro") {
    high = 64;
  }

  if (extraction < low) return "Subextraído";
  if (extraction > high) return "Sobreextraído";
  return "Balanceado";
}
function computeSensoryProfile(
  extraction: number,
  ratio: number,
  roast: Roast,
  process: Process,
  temperatureC: number,
  pressureBar: number,
  waterGH: number,
  waterKH: number
): FlavorAxes {
  const ratioN = (ratio - 1.0) / (3.2 - 1.0);

  let acidityBias = 0;
  let bitternessBias = 0;
  let bodyBias = 0;
  let astringencyBias = 0;
  let sweetnessBias = 0;

  if (roast === "claro") {
    acidityBias += 8;
    sweetnessBias -= 2;
    astringencyBias += 2;
  } else if (roast === "medio") {
    sweetnessBias += 4;
    bodyBias += 2;
  } else if (roast === "oscuro") {
    bitternessBias += 10;
    bodyBias += 6;
    acidityBias -= 6;
    astringencyBias += 6;
  }

  if (process === "natural") {
    sweetnessBias += 6;
    acidityBias += 2;
    astringencyBias -= 2;
  } else if (process === "honey") {
    sweetnessBias += 4;
    bodyBias += 2;
  } else if (process === "lavado") {
    acidityBias += 4;
    astringencyBias += 2;
  }

  const E = extraction;
  const tempN = (temperatureC - 88) / (98 - 88);
  const temperatureAcidityBias = (0.5 - tempN) * 8;
  const temperatureBitternessBias = (tempN - 0.5) * 10;
  const temperatureAstringencyBias = (tempN - 0.5) * 6;
  const pressureN = (pressureBar - 6) / (10 - 6);
  const pressureBodyBias = (pressureN - 0.5) * 8;
  const pressureBitternessBias = (pressureN - 0.5) * 6;
  const pressureAstringencyBias = (pressureN - 0.5) * 4;
  const ghN = (waterGH - 1) / (12 - 1);
  const khN = waterKH / 8;
  const waterBodyBias = (ghN - 0.5) * 8;
  const waterSweetnessBias = (ghN - 0.5) * 6;
  const waterAcidityBias = -(khN * 10);

  const acidity = clamp(
    75 - E * 0.8 + acidityBias + temperatureAcidityBias + waterAcidityBias
  );
  const bitterness = clamp(
    (E - 50) * 1.1 +
      25 +
      bitternessBias +
      temperatureBitternessBias +
      pressureBitternessBias
  );
  const astringency = clamp(
    (E - 55) * 1.15 +
      18 +
      astringencyBias +
      temperatureAstringencyBias +
      pressureAstringencyBias
  );

  const sweetnessBase = 15 + 70 * bell(E, 52, 18);

  // ratio corto suele percibirse más intenso pero menos abierto;
  // ratio más largo puede dar más claridad, pero si te pasas pierde dulzor
  let ratioSweetnessBias = 0;

  if (ratio < 1.7) {
    ratioSweetnessBias = -4;
  } else if (ratio <= 2.4) {
    ratioSweetnessBias = 4;
  } else if (ratio <= 2.8) {
    ratioSweetnessBias = 1;
  } else {
    ratioSweetnessBias = -5;
  }

  const sweetness = clamp(
    sweetnessBase + sweetnessBias + ratioSweetnessBias + waterSweetnessBias
  );

  const ristrettoBoost = (1 - ratioN) * 14;
  const body = clamp(
    25 + E * 0.55 + ristrettoBoost + bodyBias + waterBodyBias + pressureBodyBias
  );

  return {
    acidez: Math.round(acidity),
    dulzor: Math.round(sweetness),
    amargor: Math.round(bitterness),
    astringencia: Math.round(astringency),
    cuerpo: Math.round(body),
  };
}

export function simulateEspresso(input: EspressoInputs): EspressoResult {
  const grind = clamp(input.grind, 0, 100);
  const ratio = Math.max(1.0, Math.min(3.2, input.ratio));
  const doseG = Math.max(1, input.doseG);
  const temperatureC = Math.max(88, Math.min(98, input.temperatureC ?? 93));
  const pressureBar = Math.max(6, Math.min(10, input.pressureBar ?? 9));
  const waterGH = Math.max(1, Math.min(12, input.waterGH ?? 6));
  const waterKH = Math.max(0, Math.min(8, input.waterKH ?? 3));
  const baseExtraction = computeExtraction(
    grind,
    ratio,
    temperatureC,
    pressureBar
  );
  const estimatedTimeS = computeShotTime(grind, ratio, input.roast);
  const timeAdjustment = getTimeExtractionAdjustment(estimatedTimeS);
  const extraction = clamp(baseExtraction + timeAdjustment);

  // ----- Capa 3: moduladores por café (tueste / proceso)
  // Estos moduladores no “cambian física”, cambian percepción / tolerancias
  let acidityBias = 0;
  let bitternessBias = 0;
  let bodyBias = 0;
  let astringencyBias = 0;
  let sweetnessBias = 0;

  // Tueste
  if (input.roast === "claro") {
    acidityBias += 8;
    sweetnessBias -= 2;
    // claro suele castigar subextracción (más “punzante”)
    astringencyBias += 2;
  } else if (input.roast === "medio") {
    sweetnessBias += 4;
    bodyBias += 2;
  } else if (input.roast === "oscuro") {
    bitternessBias += 10;
    bodyBias += 6;
    acidityBias -= 6;
    // oscuro tolera menos sobreextracción: sube astringencia antes
    astringencyBias += 6;
  }

  const E = extraction;
  const axes = computeSensoryProfile(
    E,
    ratio,
    input.roast,
    input.process,
    temperatureC,
    pressureBar,
    waterGH,
    waterKH
  );
  const state = getExtractionState(E, input.roast);

  const styleHint: EspressoResult["styleHint"] =
    ratio < 1.8 ? "Ristretto" : ratio > 2.5 ? "Lungo" : "Espresso";

  const beverageG = Math.round(doseG * ratio);

  return {
    extraction: E,
    estimatedTimeS,
    state,
    styleHint,
    beverageG,
    axes,
  };
}