type Props = {
  grind: number;
  ratio: number;
  state: string;
  styleHint: string;
  temperatureC?: number;
  pressureBar?: number;
  dict: any;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ExtractionMap({
  grind,
  ratio,
  state,
  styleHint,
  temperatureC,
  pressureBar,
  dict,
}: Props) {
  // Normalizamos a 0..1
  const x = (clamp(ratio, 1.0, 3.2) - 1.0) / (3.2 - 1.0); // ratio corto->largo
  const y = clamp(grind, 0, 100) / 100; // grueso->fino

  const tempN =
    temperatureC !== undefined ? (temperatureC - 88) / (98 - 88) : 0.5;
  const pressureN =
    pressureBar !== undefined ? (pressureBar - 6) / (10 - 6) : 0.5;

  const xShift =
    (tempN - 0.5) * 0.04 +
    (pressureN - 0.5) * 0.03;

  const yShift =
    (tempN - 0.5) * 0.06 +
    (pressureN - 0.5) * 0.05;

  // Caja SVG
  const W = 360;
  const H = 240;
  const pad = 18;

  const shiftedX = clamp(x + xShift, 0, 1);
  const shiftedY = clamp(y + yShift, 0, 1);

  const px = pad + shiftedX * (W - pad * 2);
  const py = pad + (1 - shiftedY) * (H - pad * 2); // y=1 (fino) arriba

  // Color del punto según estado
  const dot =
    state === "Subextraído"
      ? "rgba(96,165,250,0.95)" // azul
      : state === "Sobreextraído"
        ? "rgba(248,113,113,0.95)" // rojo
        : "rgba(167,243,208,0.95)"; // verde menta

  const stateLabels: Record<string, string> = {
    Subextraído: dict.state_under,
    Balanceado: dict.state_balanced,
    Sobreextraído: dict.state_over,
  };

  const stateLabel = stateLabels[state] ?? state;

  const styleLabels: Record<string, string> = {
    Ristretto: dict.style_ristretto,
    Espresso: dict.style_espresso,
    Lungo: dict.style_lungo,
  };
  
  const styleLabel = styleHint ? styleLabels[styleHint] ?? styleHint : "";

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-neutral-300">{dict.extractionMap}</p>
        <p className="text-xs text-neutral-500">
        {styleLabel ? `≈ ${styleLabel}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <defs>
            <linearGradient id="extractionZones" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(96,165,250,0.26)" />
              <stop offset="45%" stopColor="rgba(167,243,208,0.26)" />
              <stop offset="55%" stopColor="rgba(167,243,208,0.26)" />
              <stop offset="100%" stopColor="rgba(248,113,113,0.26)" />
            </linearGradient>
          </defs>

          {/* Zonas (simple) */}
          {/* Subextraído: abajo-izquierda */}

          {/* //MAPA 1 Sustituir los path para ver el mapa 2 en degradado o comentar MAPA 1 y descomentar MAPA 2*/}
          <rect
            x={pad}
            y={pad}
            width={W - pad * 2}
            height={H - pad * 2}
            fill="url(#extractionZones)"
            rx="8"
          />

          <path
            d={`
            M ${pad} ${H - pad * 1.3}
            L ${pad} ${H - pad * 2.7}
            L ${W - pad} ${pad * 2.7}
            L ${W - pad} ${pad * 1.3}
            Z
          `}
            fill="rgba(255,255,255,0.05)"
          />

          {/* //MAPA2
// Subextraído
<path
  d={`M ${pad} ${H - pad} L ${W - pad} ${H - pad} L ${pad} ${pad} Z`}
  fill="rgba(96,165,250,0.10)"
/>

// Sobreextraído
<path
  d={`M ${W - pad} ${pad} L ${W - pad} ${H - pad} L ${pad} ${pad} Z`}
  fill="rgba(248,113,113,0.10)"
/>
*/}
          {/* Marco */}
          <rect
            x={pad}
            y={pad}
            width={W - pad * 2}
            height={H - pad * 2}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
          />

          {/* Líneas guía */}
          {[0.25, 0.5, 0.75].map((t) => (
            <g key={t}>
              <line
                x1={pad + t * (W - pad * 2)}
                y1={pad}
                x2={pad + t * (W - pad * 2)}
                y2={H - pad}
                stroke="rgba(255,255,255,0.06)"
              />
              <line
                x1={pad}
                y1={pad + t * (H - pad * 2)}
                x2={W - pad}
                y2={pad + t * (H - pad * 2)}
                stroke="rgba(255,255,255,0.06)"
              />
            </g>
          ))}

          {/* Punto */}
          <circle cx={px} cy={py} r="7" fill={dot} />
          <circle
            cx={px}
            cy={py}
            r="16"
            fill={dot}
            opacity="0.12"
          />

          {/* Etiquetas ejes */}
          <text
            x={W / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize="12"
            fill="rgba(255,255,255,0.55)"
          >
            {dict.axis_ratio}
          </text>

          <text
            x={10}
            y={H / 2}
            textAnchor="middle"
            fontSize="12"
            fill="rgba(255,255,255,0.55)"
            transform={`rotate(-90 10 ${H / 2})`}
          >
            {dict.axis_grind}
          </text>
        </svg>

        <p className="mt-2 text-xs text-neutral-500">
          {dict.zone}: <span>{stateLabel}</span>
        </p>
      </div>
    </div>
  );
}