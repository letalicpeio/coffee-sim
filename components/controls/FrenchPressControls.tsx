"use client";

import type { Dict } from "../../lib/getDictionary";
import type { Roast, Process } from "../../engine/espressoEngine";

type Props = {
    dict: Dict;
    advancedMode: boolean;
    useTemperature: boolean;
    grind: number;
    setGrind: (v: number) => void;
    ratio: number;
    setRatio: (v: number) => void;
    temperature: number;
    setTemperature: (v: number) => void;
    fpTotalTimeS: number;
    setFpTotalTimeS: (v: number) => void;
    setRoast: (v: Roast) => void;
    setProcess: (v: Process) => void;
};

function fmtTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function FrenchPressControls({
    dict,
    advancedMode,
    useTemperature,
    grind,
    setGrind,
    ratio,
    setRatio,
    temperature,
    setTemperature,
    fpTotalTimeS,
    setFpTotalTimeS,
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
                        type="range" min={10} max={18} step={0.5}
                        value={ratio}
                        onChange={(e) => setRatio(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>1:10</span>
                        <span>1:18</span>
                    </div>
                </div>

                {/* Tiempo infusión */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-200">{dict.steepTimeLabel}</span>
                        <span className="text-neutral-200">{fmtTime(fpTotalTimeS)}</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={120} max={360} step={5}
                        value={fpTotalTimeS}
                        onChange={(e) => setFpTotalTimeS(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>2:00</span>
                        <span>6:00</span>
                    </div>
                </div>

                {/* Temperatura (solo modo avanzado con temperatura habilitada) */}
                {advancedMode && useTemperature && (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-200">{dict.temperatureLabel}</span>
                            <span className="text-neutral-200">{temperature}°C</span>
                        </div>
                        <input
                            className="mt-1 w-full accent-neutral-200"
                            type="range" min={80} max={96} step={1}
                            value={temperature}
                            onChange={(e) => setTemperature(Number(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] text-neutral-500">
                            <span>80°C</span>
                            <span>96°C</span>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
}
