type Axes = {
    acidez: number;
    dulzor: number;
    amargor: number;
    astringencia: number;
    cuerpo: number;
  };
  
  function clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
  }
  
  function polar(cx: number, cy: number, r: number, angleRad: number) {
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }
  
  export default function FlavorRadar({
    axes,
    size = 360,
  }: {
    axes: Axes;
    size?: number;
  }) {
    const labels: Array<[keyof Axes, string]> = [
      ["acidez", "Acidez"],
      ["dulzor", "Dulzor"],
      ["amargor", "Amargor"],
      ["astringencia", "Astringencia"],
      ["cuerpo", "Cuerpo"],
    ];
  
    const cx = size / 2;
    const cy = size / 2;
    const outerR = (size * 0.36); // margen para etiquetas
    const gridLevels = 4;
  
    // Empezamos arriba ( -90° ) y repartimos 5 ejes
    const angles = labels.map((_, i) => (-Math.PI / 2) + (i * (2 * Math.PI) / labels.length));
  
    // Polígono del perfil
    const points = labels.map(([k], i) => {
      const v = clamp01((axes[k] ?? 0) / 100);
      const p = polar(cx, cy, outerR * v, angles[i]);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    });
  
    // Grillas (polígonos concéntricos)
    const grids = Array.from({ length: gridLevels }, (_, idx) => {
      const t = (idx + 1) / gridLevels;
      const poly = angles
        .map((a) => {
          const p = polar(cx, cy, outerR * t, a);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
      return poly;
    });
  
    // Radios
    const spokes = angles.map((a) => {
      const p = polar(cx, cy, outerR, a);
      return { x: p.x, y: p.y };
    });
  
    // Etiquetas
    const labelPos = angles.map((a) => polar(cx, cy, outerR + 26, a));
  
    return (
      <div className="w-full">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-auto"
          role="img"
          aria-label="Radar de sabor"
        >
          {/* Fondo */}
          <rect x="0" y="0" width={size} height={size} fill="transparent" />
  
          {/* Grilla */}
          {grids.map((poly, i) => (
            <polygon
              key={i}
              points={poly}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1"
            />
          ))}
  
          {/* Radios */}
          {spokes.map((p, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1"
            />
          ))}
  
          {/* Perfil */}
          <polygon
            points={points.join(" ")}
            fill="rgba(255,255,255,0.12)"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
          />
  
          {/* Puntos */}
          {labels.map(([k], i) => {
            const v = clamp01((axes[k] ?? 0) / 100);
            const p = polar(cx, cy, outerR * v, angles[i]);
            return (
              <circle
                key={String(k)}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="rgba(255,255,255,0.85)"
              />
            );
          })}
  
          {/* Etiquetas */}
          {labels.map(([, label], i) => (
            <text
              key={label}
              x={labelPos[i].x}
              y={labelPos[i].y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="rgba(255,255,255,0.70)"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    );
  }