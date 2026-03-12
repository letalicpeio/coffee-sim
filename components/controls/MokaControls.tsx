"use client";

import type { Dict } from "../../lib/getDictionary";
import type { Roast, Process } from "../../engine/espressoEngine";

type Props = {
    dict: Dict;
    advancedMode: boolean;
    grind: number; setGrind: (v: number) => void;
    ratio: number; setRatio: (v: number) => void;
    mokaHeatLevel: number; setMokaHeatLevel: (v: number) => void;
    mokaWaterTempC: number; setMokaWaterTempC: (v: number) => void;
    setRoast: (v: Roast) => void;
    setProcess: (v: Process) => void;
};

export default function MokaControls({
    dict,
    advancedMode,
    grind,
    setGrind,
    ratio,
    setRatio,
    mokaHeatLevel,
    setMokaHeatLevel,
    mokaWaterTempC,
    setMokaWaterTempC,
    setRoast,
    setProcess,
}: Props) {
    return (
        <>
            <div className="grid grid-cols-2 gap-2 lg:gap-4">
                {/* Molienda */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-200">{dict.grindLabel}</span>
                        <span className="text-neutral-200">{grind}/100</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={0} max={100} step={1}
                        value={grind}
                        onChange={(e) => setGrind(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>{dict.grindCoarse}</span>
                        <span>{dict.grindFine}</span>
                    </div>
                </div>

                {/* Ratio */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-200">{dict.ratioLabel}</span>
                        <span className="text-neutral-200">1:{ratio.toFixed(0)}</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={5} max={10} step={0.5}
                        value={ratio}
                        onChange={(e) => setRatio(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>1:5</span>
                        <span>1:10</span>
                    </div>
                </div>

                {/* Intensidad calor — SIEMPRE VISIBLE */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-200">{dict.heatIntensityLabel}</span>
                        <span className="text-neutral-200">{dict.heatLevel} {mokaHeatLevel}</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={1} max={5} step={1}
                        value={mokaHeatLevel}
                        onChange={(e) => setMokaHeatLevel(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>{dict.heatSoft}</span>
                        <span>{dict.heatStrong}</span>
                    </div>
                </div>

                {/* Temperatura agua inicial — solo en modo avanzado */}
                {advancedMode && (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-200">{dict.initialWaterTempLabel}</span>
                            <span className="text-neutral-200">{mokaWaterTempC}°C</span>
                        </div>
                        <input
                            className="mt-1 w-full accent-neutral-200"
                            type="range" min={20} max={95} step={5}
                            value={mokaWaterTempC}
                            onChange={(e) => setMokaWaterTempC(Number(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] text-neutral-500">
                            <span>20°C</span>
                            <span>95°C</span>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
}
