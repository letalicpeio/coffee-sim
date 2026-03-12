"use client";

import type { Dict } from "../../lib/getDictionary";
import type { Roast, Process } from "../../engine/espressoEngine";

type Props = {
    dict: Dict;
    grind: number;
    setGrind: (v: number) => void;
    ratio: number;
    setRatio: (v: number) => void;
    coldBrewTotalTimeH: number;
    setColdBrewTotalTimeH: (v: number) => void;
    fridgeTempC: number;
    setFridgeTempC: (v: number) => void;
    setRoast: (v: Roast) => void;
    setProcess: (v: Process) => void;
};

export default function ColdBrewControls({
    dict,
    grind,
    setGrind,
    ratio,
    setRatio,
    coldBrewTotalTimeH,
    setColdBrewTotalTimeH,
    fridgeTempC,
    setFridgeTempC,
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
                        <span className="text-neutral-200">1:{ratio.toFixed(1)}</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={4} max={10} step={0.5}
                        value={ratio}
                        onChange={(e) => setRatio(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>1:4</span>
                        <span>1:10</span>
                    </div>
                </div>

                {/* Tiempo total */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-200">{dict.totalTimeLabel}</span>
                        <span className="text-neutral-200">{coldBrewTotalTimeH}h</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={8} max={24} step={1}
                        value={coldBrewTotalTimeH}
                        onChange={(e) => setColdBrewTotalTimeH(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>8h</span>
                        <span>24h</span>
                    </div>
                </div>

                {/* Temperatura nevera */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-200">{dict.fridgeTempLabel}</span>
                        <span className="text-neutral-200">{fridgeTempC}°C</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={2} max={8} step={1}
                        value={fridgeTempC}
                        onChange={(e) => setFridgeTempC(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>2°C</span>
                        <span>8°C</span>
                    </div>
                </div>
            </div>

        </>
    );
}
