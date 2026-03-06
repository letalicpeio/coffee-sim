export type Roast = "claro" | "medio" | "oscuro";
export type Process = "lavado" | "natural" | "honey";

export type EspressoInputs = {
  // 0..100 (0 = muy grueso, 100 = muy fino)
  grind: number;
  // ratio 1:x (p.ej 2.0 significa 1:2)
  ratio: number;
  // dosis en gramos (solo para mostrar 18g -> 36g)
  doseG: number;

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

export function simulateEspresso(input: EspressoInputs): EspressoResult {
  const grind = clamp(input.grind, 0, 100);
  const ratio = Math.max(1.0, Math.min(3.2, input.ratio));
  const doseG = Math.max(1, input.doseG);

  // Normalizaciones
  // grindN: 0 grueso -> 1 fino
  const grindN = grind / 100;
  // ratioN: 1.0..3.2 -> 0..1
  const ratioN = (ratio - 1.0) / (3.2 - 1.0);

  // ----- Capa 1: extracción estimada (heurística MVP)
  // Molienda aporta más que ratio (ajustable)
  let extraction = 15 + grindN * 55 + ratioN * 35; // ~15..105
  extraction = clamp(extraction);

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

  // Proceso
  if (input.process === "natural") {
    sweetnessBias += 6;
    acidityBias += 2;
    astringencyBias -= 2;
  } else if (input.process === "honey") {
    sweetnessBias += 4;
    bodyBias += 2;
  } else if (input.process === "lavado") {
    acidityBias += 4;
    // más “claridad”, puede percibirse más seco si te pasas
    astringencyBias += 2;
  }

  // ----- Capa 2: traducción sensorial
  // Usamos la extracción como eje principal:
  // - acidez: alta cuando extracción es baja
  // - amargor/astringencia: suben cuando extracción es alta
  // - dulzor: campana con pico en zona media
  // - cuerpo: sube con extracción y también con ratio corto (ristretto) suele percibirse más “denso”
  const E = extraction;

  const acidity = clamp(75 - E * 0.8 + acidityBias);
  const bitterness = clamp((E - 50) * 1.1 + 25 + bitternessBias);
  const astringency = clamp((E - 55) * 1.15 + 18 + astringencyBias);

  // Dulzor: pico alrededor de 52, anchura 18
  const sweetnessBase = 15 + 70 * bell(E, 52, 18);
  const sweetness = clamp(sweetnessBase + sweetnessBias);

  // Cuerpo: sube con extracción y con ratio bajo (ristretto)
  const ristrettoBoost = (1 - ratioN) * 14; // más boost cuanto más corto
  const body = clamp(25 + E * 0.55 + ristrettoBoost + bodyBias);

  // Estado sub/balance/sobre (umbrales MVP)
  const state: EspressoResult["state"] =
    E < 40 ? "Subextraído" : E > 68 ? "Sobreextraído" : "Balanceado";

  // Etiqueta estilo por ratio (solo informativa)
  const styleHint: EspressoResult["styleHint"] =
    ratio < 1.8 ? "Ristretto" : ratio > 2.5 ? "Lungo" : "Espresso";

  const beverageG = Math.round(doseG * ratio);

  return {
    extraction: E,
    state,
    styleHint,
    beverageG,
    axes: {
      acidez: Math.round(acidity),
      dulzor: Math.round(sweetness),
      amargor: Math.round(bitterness),
      astringencia: Math.round(astringency),
      cuerpo: Math.round(body),
    },
  };
}