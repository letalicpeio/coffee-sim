type Axes = {
    acidez: number;
    dulzor: number;
    amargor: number;
    astringencia: number;
    cuerpo: number;
};

/**
 * A single profile to render on the radar.
 * `color` drives both the polygon stroke and the extraction map dot.
 * `temperatureC` and `pressureBar` are used to apply a small dot-position
 * shift on the extraction map (espresso-specific effect).
 */
export type RadarProfile = {
    axes: Axes;
    grind: number;
    ratio: number;
    /** CSS color value — used for polygon stroke/fill and map dot. */
    color: string;
    temperatureC?: number;
    pressureBar?: number;
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

/** Computes the SVG polygon points string for a given profile. */
function profilePoints(
    profile: RadarProfile,
    labels: Array<[keyof Axes, string]>,
    angles: number[],
    cx: number,
    cy: number,
    outerR: number
): string {
    return labels
        .map(([k], i) => {
            const v = clamp01((profile.axes[k] ?? 0) / 100);
            const p = polar(cx, cy, outerR * v, angles[i]);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
}

/** Computes the extraction map dot position for a given profile. */
function mapDotPosition(
    profile: RadarProfile,
    cx: number,
    cy: number,
    outerR: number
): { x: number; y: number } {
    // Note: ratio range is hardcoded to espresso scale (1.0–3.2).
    // For other methods with larger ratios the dot is clamped to the right edge.
    // This is a known limitation — ratioRange should eventually be part of RadarProfile.
    const x = (clamp(profile.ratio, 1.0, 3.2) - 1.0) / (3.2 - 1.0);
    const y = clamp(profile.grind, 0, 100) / 100;

    const tempN =
        profile.temperatureC !== undefined
            ? (profile.temperatureC - 88) / (98 - 88)
            : 0.5;
    const pressureN =
        profile.pressureBar !== undefined
            ? (profile.pressureBar - 6) / (10 - 6)
            : 0.5;

    const xShift = (tempN - 0.5) * 0.04 + (pressureN - 0.5) * 0.03;
    const yShift = (tempN - 0.5) * 0.06 + (pressureN - 0.5) * 0.05;

    const mapRadius = outerR * 0.95;
    return {
        x: cx + (clamp(x + xShift, 0, 1) - 0.5) * 2 * mapRadius * 0.78,
        y: cy - (clamp(y + yShift, 0, 1) - 0.5) * 2 * mapRadius * 0.78,
    };
}

/**
 * Hybrid radar + extraction map component.
 *
 * Accepts one or two profiles. When two profiles are provided, both polygons
 * are overlaid on the same chart using their respective colors.
 */
export default function HybridRadarMap({
    profiles,
    dict,
    size = 340,
}: {
    profiles: RadarProfile[];
    dict: any;
    size?: number;
}) {
    const labels: Array<[keyof Axes, string]> = [
        ["acidez",      dict.axis_acidity],
        ["dulzor",      dict.axis_sweetness],
        ["amargor",     dict.axis_bitterness],
        ["astringencia",dict.axis_astringency],
        ["cuerpo",      dict.axis_body],
    ];

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.30;
    const gridLevels = 4;

    const angles = labels.map(
        (_, i) => -Math.PI / 2 + (i * (2 * Math.PI)) / labels.length
    );

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
                        <stop offset="0%"   stopColor="rgba(96,165,250,1)" />
                        <stop offset="45%"  stopColor="rgba(167,243,208,0.20)" />
                        <stop offset="55%"  stopColor="rgba(167,243,208,0.20)" />
                        <stop offset="100%" stopColor="rgba(248,113,113,1)" />
                    </linearGradient>

                    <clipPath id="hybridRadarClip">
                        <polygon points={grids[grids.length - 1]} />
                    </clipPath>
                </defs>

                {/* fondo degradado */}
                <rect
                    x={cx - outerR} y={cy - outerR}
                    width={outerR * 2} height={outerR * 2}
                    fill="url(#hybridZones)"
                    clipPath="url(#hybridRadarClip)"
                />

                {/* grilla */}
                {grids.map((poly, i) => (
                    <polygon key={i} points={poly} fill="none"
                        stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
                ))}

                {/* radios */}
                {spokes.map((p, i) => (
                    <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
                        stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
                ))}

                {/* perfiles — se renderizan en orden: A debajo, B encima */}
                {profiles.map((profile, pi) => {
                    const pts = profilePoints(profile, labels, angles, cx, cy, outerR);
                    const dot = mapDotPosition(profile, cx, cy, outerR);
                    return (
                        <g key={pi}>
                            <polygon
                                points={pts}
                                fill={profile.color}
                                fillOpacity={0.12}
                                stroke={profile.color}
                                strokeOpacity={0.7}
                                strokeWidth={2}
                            />

                            {labels.map(([k], i) => {
                                const v = clamp01((profile.axes[k] ?? 0) / 100);
                                const p = polar(cx, cy, outerR * v, angles[i]);
                                return (
                                    <circle
                                        key={`${pi}-${String(k)}`}
                                        cx={p.x} cy={p.y} r="3.5"
                                        fill={profile.color} fillOpacity={0.85}
                                    />
                                );
                            })}

                            <circle cx={dot.x} cy={dot.y} r="7"  fill={profile.color} />
                            <circle cx={dot.x} cy={dot.y} r="15" fill={profile.color} opacity="0.14" />
                        </g>
                    );
                })}

                {/* etiquetas de ejes */}
                {labels.map(([, label], i) => (
                    <text
                        key={label}
                        x={labelPos[i].x} y={labelPos[i].y}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize="12" fill="rgba(255,255,255,0.72)"
                    >
                        {label}
                    </text>
                ))}

                <text x={size / 2} y={size - 6} textAnchor="middle"
                    fontSize="12" fill="rgba(255,255,255,0.55)">
                    {dict.axis_ratio}
                </text>

                <text x={12} y={size / 2} textAnchor="middle"
                    fontSize="12" fill="rgba(255,255,255,0.55)"
                    transform={`rotate(-90 12 ${size / 2})`}>
                    {dict.axis_grind}
                </text>
            </svg>
        </div>
    );
}
