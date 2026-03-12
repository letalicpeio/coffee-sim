"use client";

import type { Dict } from "../../lib/getDictionary";
import type { Roast, Process } from "../../engine/espressoEngine";

type Props = {
    dict: Dict;
    advancedMode: boolean;
    grind: number; setGrind: (v: number) => void;
    ratio: number; setRatio: (v: number) => void;
    temperature: number; setTemperature: (v: number) => void;
    aeroTotalTimeS: number; setAeroTotalTimeS: (v: number) => void;
    aeroPressureLevel: number; setAeroPressureLevel: (v: number) => void;
    aeroInverted: boolean; setAeroInverted: (v: boolean) => void;
    setRoast: (v: Roast) => void;
    setProcess: (v: Process) => void;
};

export default function AeropressControls({
    dict,
    advancedMode,
    grind,
    setGrind,
    ratio,
    setRatio,
    temperature,
    setTemperature,
    aeroTotalTimeS,
    setAeroTotalTimeS,
    aeroPressureLevel,
    setAeroPressureLevel,
    aeroInverted,
    setAeroInverted,
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
                        type="range" min={6} max={15} step={0.5}
                        value={ratio}
                        onChange={(e) => setRatio(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>1:6</span>
                        <span>1:15</span>
                    </div>
                </div>

                {/* Temperatura — SIEMPRE VISIBLE (básico para Aeropress) */}
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

                {/* Tiempo */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-200">Tiempo</span>
                        <span className="text-neutral-200">{aeroTotalTimeS}s</span>
                    </div>
                    <input
                        className="mt-1 w-full accent-neutral-200"
                        type="range" min={30} max={120} step={5}
                        value={aeroTotalTimeS}
                        onChange={(e) => setAeroTotalTimeS(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>30s</span>
                        <span>120s</span>
                    </div>
                </div>
            </div>

            {/* Avanzado */}
            {advancedMode && (
                <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    {/* Presión */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-200">Presión (1-5)</span>
                            <span className="text-neutral-200">{aeroPressureLevel}</span>
                        </div>
                        <input
                            className="mt-1 w-full accent-neutral-200"
                            type="range" min={1} max={5} step={1}
                            value={aeroPressureLevel}
                            onChange={(e) => setAeroPressureLevel(Number(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] text-neutral-500">
                            <span>1</span>
                            <span>5</span>
                        </div>
                    </div>

                    {/* Toggle invertido */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 flex flex-col justify-center gap-2">
                        <span className="text-[11px] text-neutral-200">Invertido</span>
                        <button
                            type="button"
                            onClick={() => setAeroInverted(!aeroInverted)}
                            className={`rounded-lg border border-neutral-700 px-3 py-1.5 text-xs transition hover:bg-neutral-800 ${aeroInverted ? "bg-neutral-700" : "bg-neutral-900"}`}
                        >
                            {aeroInverted ? "Sí" : "No"}
                        </button>
                    </div>
                </div>
            )}

        </>
    );
}
