"use client";

import type { Dict } from "../../lib/getDictionary";
import type { Roast, Process } from "../../engine/espressoEngine";

type Props = {
    dict: Dict;
    advancedMode: boolean;
    useTemperature: boolean;
    usePressure: boolean;
    grind: number;
    setGrind: (v: number) => void;
    ratio: number;
    setRatio: (v: number) => void;
    temperature: number;
    setTemperature: (v: number) => void;
    pressure: number;
    setPressure: (v: number) => void;
    setRoast: (v: Roast) => void;
    setProcess: (v: Process) => void;
};

function fmtRatio(r: number) {
    return `1:${r.toFixed(1)}`;
}

export default function EspressoControls({
    dict,
    advancedMode,
    useTemperature,
    usePressure,
    grind,
    setGrind,
    ratio,
    setRatio,
    temperature,
    setTemperature,
    pressure,
    setPressure,
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
                        <span className="text-neutral-200">{fmtRatio(ratio)}</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={1.0} max={3.2} step={0.1}
                        value={ratio}
                        onChange={(e) => setRatio(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>{dict.ratioShort}</span>
                        <span>{dict.ratioLong}</span>
                    </div>
                </div>

                {/* Temperatura (avanzado) */}
                {advancedMode && useTemperature && (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-200">{dict.temperatureLabel}</span>
                            <span className="text-neutral-200">{temperature}°C</span>
                        </div>
                        <input
                            className="mt-1 w-full accent-neutral-200"
                            type="range" min={88} max={98} step={1}
                            value={temperature}
                            onChange={(e) => setTemperature(Number(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] text-neutral-500">
                            <span>88°C</span>
                            <span>98°C</span>
                        </div>
                    </div>
                )}

                {/* Presión (avanzado) */}
                {advancedMode && usePressure && (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-200">{dict.pressureLabel}</span>
                            <span className="text-neutral-200">{pressure} bar</span>
                        </div>
                        <input
                            className="mt-1 w-full accent-neutral-200"
                            type="range" min={6} max={10} step={0.5}
                            value={pressure}
                            onChange={(e) => setPressure(Number(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] text-neutral-500">
                            <span>6 bar</span>
                            <span>10 bar</span>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
}
