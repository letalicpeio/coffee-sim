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

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export default function HybridRadarMap({
    axes,
    grind,
    ratio,
    state,
    dict,
    size = 340,
}: {
    axes: Axes;
    grind: number;
    ratio: number;
    state: string;
    dict: any;
    size?: number;
}) {
    const labels: Array<[keyof Axes, string]> = [
        ["acidez", dict.axis_acidity],
        ["dulzor", dict.axis_sweetness],
        ["amargor", dict.axis_bitterness],
        ["astringencia", dict.axis_astringency],
        ["cuerpo", dict.axis_body],
    ];

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.30;
    const gridLevels = 4;

    const angles = labels.map(
        (_, i) => -Math.PI / 2 + (i * (2 * Math.PI)) / labels.length
    );

    const points = labels.map(([k], i) => {
        const v = clamp01((axes[k] ?? 0) / 100);
        const p = polar(cx, cy, outerR * v, angles[i]);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    });

    const grids = Array.from({ length: gridLevels }, (_, idx) => {
        const t = (idx + 1) / gridLevels;
        return angles
            .map((a) => {
                const p = polar(cx, cy, outerR * t, a);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ");
    });

    const spokes = angles.map((a) => polar(cx, cy, outerR, a));
    const labelPos = angles.map((a) => polar(cx, cy, outerR + 24, a));

    // Posición del punto del mapa integrada en el radar
    const x = (clamp(ratio, 1.0, 3.2) - 1.0) / (3.2 - 1.0);
    const y = clamp(grind, 0, 100) / 100;

    const mapRadius = outerR * 0.95;
    const mapX = cx + (x - 0.5) * 2 * mapRadius * 0.78;
    const mapY = cy - (y - 0.5) * 2 * mapRadius * 0.78;

    const dot =
        state === "Subextraído"
            ? "rgba(96,165,250,0.95)"
            : state === "Sobreextraído"
                ? "rgba(248,113,113,0.95)"
                : "rgba(167,243,208,0.95)";

    return (
        <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="h-auto w-full"
                role="img"
                aria-label={dict.flavorRadar}
            >
                <defs>
                    <linearGradient id="hybridZones" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(96,165,250,1)" />
                        <stop offset="45%" stopColor="rgba(167,243,208,0.20)" />
                        <stop offset="55%" stopColor="rgba(167,243,208,0.20)" />
                        <stop offset="100%" stopColor="rgba(248,113,113,1)" />
                    </linearGradient>

                    <clipPath id="hybridRadarClip">
                        <polygon points={grids[grids.length - 1]} />
                    </clipPath>
                </defs>

                {/* fondo degradado recortado con la forma exterior del radar */}
                <rect
                    x={cx - outerR}
                    y={cy - outerR}
                    width={outerR * 2}
                    height={outerR * 2}
                    fill="url(#hybridZones)"
                    clipPath="url(#hybridRadarClip)"
                />

                {/* grilla */}
                {grids.map((poly, i) => (
                    <polygon
                        key={i}
                        points={poly}
                        fill="none"
                        stroke="rgba(255,255,255,0.10)"
                        strokeWidth="1"
                    />
                ))}

                {/* radios */}
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

                {/* perfil */}
                <polygon
                    points={points.join(" ")}
                    fill="rgba(255,255,255,0.12)"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="2"
                />

                {/* puntos del perfil */}
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

                {/* punto del mapa */}
                <circle cx={mapX} cy={mapY} r="7" fill={dot} />
                <circle cx={mapX} cy={mapY} r="15" fill={dot} opacity="0.14" />

                {/* etiquetas de vértices */}
                {labels.map(([, label], i) => (
                    <text
                        key={label}
                        x={labelPos[i].x}
                        y={labelPos[i].y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fill="rgba(255,255,255,0.72)"
                    >
                        {label}
                    </text>
                ))}

                {/* eje ratio */}
                <text
                    x={size / 2}
                    y={size - 6}
                    textAnchor="middle"
                    fontSize="12"
                    fill="rgba(255,255,255,0.55)"
                >
                    {dict.axis_ratio}
                </text>

                {/* eje grind */}
                <text
                    x={12}
                    y={size / 2}
                    textAnchor="middle"
                    fontSize="12"
                    fill="rgba(255,255,255,0.55)"
                    transform={`rotate(-90 12 ${size / 2})`}
                >
                    {dict.axis_grind}
                </text>
            </svg>
        </div>
    );
}