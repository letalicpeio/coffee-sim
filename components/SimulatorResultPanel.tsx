"use client";

import ExtractionMap from "./ExtractionMap";
import FlavorRadar from "./FlavorRadar";
import HybridRadarMap from "./HybridRadarMap";
import type { RadarProfile } from "./HybridRadarMap";
import type { Dict } from "../lib/getDictionary";
import type { BrewMethod } from "./types/brew";

type Axes = {
    acidez: number;
    dulzor: number;
    amargor: number;
    astringencia: number;
    cuerpo: number;
};

type ResultData = {
    state: string;
    styleHint?: string;
    extraction: number;
    beverageG: number;
    estimatedTimeS: number;
    axes: Axes;
};

type Props = {
    dict: Dict;
    recipeName: string;
    stateLabel: string;
    styleLabel: string;
    roastLabel: string;
    processLabel: string;
    stateDescription: string;
    result: ResultData;
    ratio: number;
    grind: number;
    doseG: number;
    advancedMode: boolean;
    useTemperature: boolean;
    usePressure: boolean;
    temperature: number;
    pressure: number;
    showMapHelp: boolean;
    setShowMapHelp: (value: boolean) => void;
    showRadarHelp: boolean;
    setShowRadarHelp: (value: boolean) => void;
    showHybridHelp: boolean;
    setShowHybridHelp: (value: boolean) => void;
    showEngineInfo: boolean;
    setShowEngineInfo: (value: boolean) => void;
    method: BrewMethod;
    /** When true, renders without the outer card wrapper (used inside a shared mobile container). */
    slim?: boolean;
};

function fmtRatio(r: number) {
    return `1:${r.toFixed(1)}`;
}

function stateColor(state: string): string {
    if (state === "Subextraído")  return "rgba(96,165,250,0.95)";
    if (state === "Sobreextraído") return "rgba(248,113,113,0.95)";
    return "rgba(167,243,208,0.95)";
}

export default function SimulatorResultPanel({
    dict,
    recipeName,
    stateLabel,
    styleLabel,
    roastLabel,
    processLabel,
    stateDescription,
    result,
    ratio,
    grind,
    doseG,
    advancedMode,
    useTemperature,
    usePressure,
    temperature,
    pressure,
    showMapHelp,
    setShowMapHelp,
    showRadarHelp,
    setShowRadarHelp,
    showHybridHelp,
    setShowHybridHelp,
    showEngineInfo,
    setShowEngineInfo,
    method,
    slim,
}: Props) {
    const outerCls = slim
        ? "px-4 pt-4"
        : "rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6";
    return (
        <div className={outerCls}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        {recipeName ? recipeName : dict.result}
                    </h2>

                    <p className="mt-1 text-sm text-neutral-400">
                        {dict.statusLabel}:{" "}
                        <span className="text-neutral-200">{stateLabel}</span>
                        <span className="text-neutral-500"> · </span>
                        {dict.styleLabel}:{" "}
                        <span className="text-neutral-200">{styleLabel}</span>
                    </p>

                    <p className="mt-2 text-xs text-neutral-500">
                        {result.styleHint === "Ristretto" && dict.style_ristretto_desc}
                        {result.styleHint === "Espresso" && dict.style_espresso_desc}
                        {result.styleHint === "Lungo" && dict.style_lungo_desc}
                    </p>
                </div>
            </div>

            {recipeName ? (
                <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-neutral-100">{recipeName}</p>
                            <p className="mt-1 text-xs text-neutral-400">
                                {styleLabel} · {roastLabel} · {processLabel}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-neutral-400">
                                {doseG}g → {result.beverageG}g ({fmtRatio(ratio)})
                            </p>
                            <p className="mt-1 text-xs text-neutral-300">{stateLabel}</p>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className={slim ? "mt-4" : "mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-6"}>
                <div className="flex items-start justify-between gap-0 lg:gap-4">
                    <div className="min-w-0">
                        <p className="text-sm text-neutral-300">{dict.flavorProfile}</p>
                        <p className="hidden lg:block mt-1 text-xs text-neutral-500">{dict.axesLabel}</p>
                    </div>

                    <div className="ml-auto flex items-start gap-0 text-left lg:gap-8 lg:text-right">
                        <div>
                            <p className="text-xs text-neutral-400">{dict.estimatedExtraction}</p>
                            <p className="text-sm text-neutral-200">
                                {Math.round(result.extraction)}/100
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-neutral-300">
                                {doseG}g → {result.beverageG}g ({fmtRatio(ratio)})
                            </p>
                            <p className="mt-1 text-xs text-neutral-400 whitespace-nowrap">
                                {dict.estimatedTime}: {result.estimatedTimeS}s
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-2">
                    {/* mobile */}
                    <div className="lg:hidden">
                        <div className="mb-2 flex items-center gap-3">
                            <span className="text-xs text-neutral-500">
                                {dict.hybridHelpLabel}
                            </span>

                            <button
                                type="button"
                                onClick={() => setShowHybridHelp(!showHybridHelp)}
                                className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                            >
                                {showHybridHelp ? dict.hybridHelpHide : dict.hybridHelpShow}
                            </button>
                        </div>

                        {showHybridHelp && (
                            <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-xs text-neutral-300">
                                <p>{dict.mapHelpP1}</p>
                                <p className="mt-2">{dict.mapHelpP2}</p>
                                <p className="mt-2">{dict.mapHelpP3}</p>
                                <p className="mt-2">{dict[`mapHelpP4_${method}`] ?? dict.mapHelpP4}</p>

                                <div className="my-3 border-t border-neutral-800" />

                                <p>{dict.radarHelpP1}</p>
                                <p className="mt-2">{dict.radarHelpP2}</p>
                                <p className="mt-2">{dict.radarHelpP3}</p>
                                <p className="mt-2">{dict[`radarHelpP4_${method}`] ?? dict.radarHelpP4}</p>
                            </div>
                        )}

                        <HybridRadarMap
                            profiles={[{
                                axes: result.axes,
                                grind,
                                ratio,
                                color: stateColor(result.state),
                                temperatureC: advancedMode && useTemperature ? temperature : undefined,
                                pressureBar:  advancedMode && usePressure  ? pressure    : undefined,
                            } satisfies RadarProfile]}
                            dict={dict}
                        />
                    </div>

                    {/* desktop */}
                    <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
                        <div className="flex flex-col">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">{dict.mapHelpLabel}</span>

                                <button
                                    type="button"
                                    onClick={() => setShowMapHelp(!showMapHelp)}
                                    className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                                >
                                    {showMapHelp ? dict.mapHelpHide : dict.mapHelpShow}
                                </button>
                            </div>

                            {showMapHelp && (
                                <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-xs text-neutral-300">
                                    <p>{dict.mapHelpP1}</p>
                                    <p className="mt-2">{dict.mapHelpP2}</p>
                                    <p className="mt-2">{dict.mapHelpP3}</p>
                                    <p className="mt-2">{dict[`mapHelpP4_${method}`] ?? dict.mapHelpP4}</p>
                                </div>
                            )}

                            <ExtractionMap
                                grind={grind}
                                ratio={ratio}
                                ratioMin={
                                    method === "v60" ? 10 :
                                    method === "french_press" ? 10 :
                                    method === "aeropress" ? 6 :
                                    method === "moka" ? 5 :
                                    method === "cold_brew" ? 4 : 1.0
                                }
                                ratioMax={
                                    method === "v60" ? 20 :
                                    method === "french_press" ? 18 :
                                    method === "aeropress" ? 15 :
                                    method === "moka" ? 10 :
                                    method === "cold_brew" ? 10 : 3.2
                                }
                                state={result.state}
                                styleHint={result.styleHint}
                                temperatureC={advancedMode && useTemperature ? temperature : undefined}
                                pressureBar={advancedMode && usePressure ? pressure : undefined}
                                dict={dict}
                            />
                        </div>

                        <div className="flex flex-col">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">{dict.radarHelpLabel}</span>

                                <button
                                    type="button"
                                    onClick={() => setShowRadarHelp(!showRadarHelp)}
                                    className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                                >
                                    {showRadarHelp ? dict.radarHelpHide : dict.radarHelpShow}
                                </button>
                            </div>

                            {showRadarHelp && (
                                <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-xs text-neutral-300">
                                    <p>{dict.radarHelpP1}</p>
                                    <p className="mt-2">{dict.radarHelpP2}</p>
                                    <p className="mt-2">{dict.radarHelpP3}</p>
                                    <p className="mt-2">{dict[`radarHelpP4_${method}`] ?? dict.radarHelpP4}</p>
                                </div>
                            )}

                            <FlavorRadar axes={result.axes} dict={dict} />
                        </div>
                    </div>
                </div>

                <p className="mt-2 min-h-[4em] text-[11px] leading-[1.3] text-neutral-400 lg:mt-4 lg:min-h-0 lg:text-xs">
                    {stateDescription}
                </p>
            </div>

            <p className="hidden lg:block mt-6 text-xs text-neutral-500">{dict.note}</p>

            <button
                type="button"
                onClick={() => setShowEngineInfo(!showEngineInfo)}
                className="hidden lg:block mt-2 rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
            >
                {showEngineInfo ? dict.engineHide : dict.engineExplain}
            </button>

            {showEngineInfo && (
                <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-xs text-neutral-300">
                    <div className="mb-4 grid grid-cols-2 gap-2 text-[10px] text-neutral-400 sm:grid-cols-4">
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 px-2 py-1.5 text-center">
                            <p className="text-neutral-200">8</p>
                            <p>{dict.engineVariables}</p>
                        </div>

                        <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 px-2 py-1.5 text-center">
                            <p className="text-neutral-200">5</p>
                            <p>{dict.engineSensoryAxes}</p>
                        </div>

                        <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 px-2 py-1.5 text-center">
                            <p className="text-neutral-200">0–100</p>
                            <p>{dict.engineExtractionIndex}</p>
                        </div>

                        <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 px-2 py-1.5 text-center">
                            <p className="text-neutral-200">AI</p>
                            <p>{dict.engineIterativeTuning}</p>
                        </div>
                    </div>

                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                                {dict.engineTitle}
                            </p>
                            <p className="mt-1 text-sm font-medium text-neutral-100">
                                {dict.engineTechnicalOverview}
                            </p>
                        </div>

                        <span className="rounded-full border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-[10px] uppercase tracking-wide text-neutral-300">
                            {dict.engineModelTag}
                        </span>
                    </div>

                    <div className="space-y-3 text-[11px] leading-relaxed">
                        <div>
                            <p className="font-medium text-neutral-200">{dict.engineSection_inputNorm}</p>
                            <p className="text-neutral-400">{dict.engineInfo1}</p>
                        </div>

                        <div>
                            <p className="font-medium text-neutral-200">{dict.engineSection_primaryDrivers}</p>
                            <p className="text-neutral-400">{dict.engineInfo2}</p>
                        </div>

                        <div>
                            <p className="font-medium text-neutral-200">{dict.engineSection_coffeeMod}</p>
                            <p className="text-neutral-400">{dict.engineInfo3}</p>
                        </div>

                        <div>
                            <p className="font-medium text-neutral-200">{dict.engineSection_advancedParams}</p>
                            <p className="text-neutral-400">{dict.engineInfo4}</p>
                        </div>

                        <div>
                            <p className="font-medium text-neutral-200">{dict.engineSection_sensoryProjection}</p>
                            <p className="text-neutral-400">{dict.engineInfo5}</p>
                        </div>

                        <div>
                            <p className="font-medium text-neutral-200">{dict.engineSection_sensoryAxes}</p>
                            <p className="text-neutral-400">{dict.engineInfo6}</p>
                        </div>

                        <div>
                            <p className="font-medium text-neutral-200">{dict.engineSection_probabilistic}</p>
                            <p className="text-neutral-400">{dict.engineInfo7}</p>
                        </div>

                        <div>
                            <p className="font-medium text-neutral-200">{dict.engineSection_aiCalibration}</p>
                            <p className="text-neutral-400">{dict.engineInfo8}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}