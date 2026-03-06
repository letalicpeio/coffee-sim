type Props = {
    // 0..100 (0 = muy grueso, 100 = muy fino)
    grind: number;
    // ratio 1:x (1.0..3.2)
    ratio: number;
    // "Subextraído" | "Balanceado" | "Sobreextraído"
    state: string;
    // opcional para mostrar etiqueta
    styleHint?: string;
  };
  
  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }
  
  export default function ExtractionMap({
    grind,
    ratio,
    state,
    styleHint,
  }: Props) {
    // Normalizamos a 0..1
    const x = (clamp(ratio, 1.0, 3.2) - 1.0) / (3.2 - 1.0); // ratio corto->largo
    const y = clamp(grind, 0, 100) / 100; // grueso->fino
  
    // Caja SVG
    const W = 360;
    const H = 240;
    const pad = 18;
  
    const px = pad + x * (W - pad * 2);
    const py = pad + (1 - y) * (H - pad * 2); // y=1 (fino) arriba
  
    // Color del punto según estado
    const dot =
      state === "Subextraído"
        ? "rgba(96,165,250,0.95)" // azul
        : state === "Sobreextraído"
        ? "rgba(248,113,113,0.95)" // rojo
        : "rgba(167,243,208,0.95)"; // verde menta
  
    return (
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-neutral-300">Mapa de extracción</p>
          <p className="text-xs text-neutral-500">
            {styleHint ? `≈ ${styleHint}` : ""}
          </p>
        </div>
  
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Zonas (simple) */}
            {/* Subextraído: abajo-izquierda */}
            <path
              d={`M ${pad} ${H - pad} L ${W - pad} ${H - pad} L ${pad} ${pad} Z`}
              fill="rgba(59,130,246,0.06)"
            />
            {/* Sobreextraído: arriba-derecha */}
            <path
              d={`M ${W - pad} ${pad} L ${W - pad} ${H - pad} L ${pad} ${pad} Z`}
              fill="rgba(239,68,68,0.06)"
            />
            {/* Banda central “balanceado” (diagonal) */}
            <path
              d={`
                M ${pad} ${H - pad * 1.2}
                L ${pad} ${H - pad * 2.8}
                L ${W - pad} ${pad * 2.8}
                L ${W - pad} ${pad * 1.2}
                Z
              `}
              fill="rgba(16,185,129,0.06)"
            />
  
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
              Ratio (corto → largo)
            </text>
  
            <text
              x={10}
              y={H / 2}
              textAnchor="middle"
              fontSize="12"
              fill="rgba(255,255,255,0.55)"
              transform={`rotate(-90 10 ${H / 2})`}
            >
              Molienda (gruesa → fina)
            </text>
          </svg>
  
          <p className="mt-2 text-xs text-neutral-500">
            Zona: <span className="text-neutral-200">{state}</span>
          </p>
        </div>
      </div>
    );
  }