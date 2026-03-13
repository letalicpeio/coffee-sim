"use client";

import type { Dict } from "../lib/getDictionary";
import type { Process, Roast } from "../engine/espressoEngine";
import type { BrewMethod } from "./types/brew";
import EspressoControls from "./controls/EspressoControls";
import V60Controls from "./controls/V60Controls";
import FrenchPressControls from "./controls/FrenchPressControls";
import AeropressControls from "./controls/AeropressControls";
import MokaControls from "./controls/MokaControls";
import ColdBrewControls from "./controls/ColdBrewControls";

type Props = {
    dict: Dict;
    locale: "es" | "en";
    method: BrewMethod;
    advancedMode: boolean;
    setAdvancedMode: (value: boolean) => void;
    useTemperature: boolean;
    setUseTemperature: (value: boolean) => void;
    usePressure: boolean;
    setUsePressure: (value: boolean) => void;
    useWater: boolean;
    setUseWater: (value: boolean) => void;
    grind: number;
    setGrind: (value: number) => void;
    ratio: number;
    setRatio: (value: number) => void;
    temperature: number;
    setTemperature: (value: number) => void;
    pressure: number;
    setPressure: (value: number) => void;
    waterGH: number;
    setWaterGH: (value: number) => void;
    waterKH: number;
    setWaterKH: (value: number) => void;
    roast: Roast;
    setRoast: (value: Roast) => void;
    process: Process;
    setProcess: (value: Process) => void;
    roastLabel: string;
    processLabel: string;
    v60TotalTimeS: number;
    setV60TotalTimeS: (value: number) => void;
    fpTotalTimeS: number;
    setFpTotalTimeS: (value: number) => void;
    aeroTotalTimeS: number;
    setAeroTotalTimeS: (value: number) => void;
    aeroPressureLevel: number;
    setAeroPressureLevel: (value: number) => void;
    aeroInverted: boolean;
    setAeroInverted: (value: boolean) => void;
    mokaHeatLevel: number;
    setMokaHeatLevel: (value: number) => void;
    mokaWaterTempC: number;
    setMokaWaterTempC: (value: number) => void;
    coldBrewTotalTimeH: number;
    setColdBrewTotalTimeH: (value: number) => void;
    coldBrewFridgeTempC: number;
    setColdBrewFridgeTempC: (value: number) => void;
};

export default function SimulatorControlsPanel({
    dict,
    method,
    advancedMode,
    setAdvancedMode,
    useTemperature,
    usePressure,
    useWater,
    grind, setGrind,
    ratio, setRatio,
    temperature, setTemperature,
    pressure, setPressure,
    waterGH, setWaterGH,
    waterKH, setWaterKH,
    roast, setRoast,
    process, setProcess,
    roastLabel,
    processLabel,
    v60TotalTimeS,
    setV60TotalTimeS,
    fpTotalTimeS,
    setFpTotalTimeS,
    aeroTotalTimeS,
    setAeroTotalTimeS,
    aeroPressureLevel,
    setAeroPressureLevel,
    aeroInverted,
    setAeroInverted,
    mokaHeatLevel,
    setMokaHeatLevel,
    mokaWaterTempC,
    setMokaWaterTempC,
    coldBrewTotalTimeH,
    setColdBrewTotalTimeH,
    coldBrewFridgeTempC,
    setColdBrewFridgeTempC,
}: Props) {
    return (
        <div className="rounded-2xl rounded-t-none border border-t-0 border-neutral-800 bg-neutral-900/40 px-4 py-3 lg:rounded-t-2xl lg:border-t lg:border-neutral-600 lg:p-6">
            {/* Cabecera */}
            <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{dict.controls}</h2>
                <button
                    type="button"
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                >
                    {advancedMode ? dict.advancedHide : dict.advancedShow}
                </button>
            </div>

            <p className="hidden lg:block mt-1 text-sm text-neutral-400">
                {dict.controlsDescription}
            </p>

            <div className="mt-4 space-y-4 lg:mt-6 lg:space-y-5">
                {/* Controles específicos del método */}
                {method === "espresso" && (
                    <EspressoControls
                        dict={dict}
                        advancedMode={advancedMode}
                        useTemperature={useTemperature}
                        usePressure={usePressure}
                        grind={grind} setGrind={setGrind}
                        ratio={ratio} setRatio={setRatio}
                        temperature={temperature} setTemperature={setTemperature}
                        pressure={pressure} setPressure={setPressure}
                        setRoast={setRoast}
                        setProcess={setProcess}
                    />
                )}

                {method === "v60" && (
                    <V60Controls
                        dict={dict}
                        grind={grind} setGrind={setGrind}
                        ratio={ratio} setRatio={setRatio}
                        temperature={temperature} setTemperature={setTemperature}
                        v60TotalTimeS={v60TotalTimeS} setV60TotalTimeS={setV60TotalTimeS}
                        setRoast={setRoast}
                        setProcess={setProcess}
                    />
                )}

                {method === "french_press" && (
                    <FrenchPressControls
                        dict={dict}
                        advancedMode={advancedMode}
                        useTemperature={useTemperature}
                        grind={grind} setGrind={setGrind}
                        ratio={ratio} setRatio={setRatio}
                        temperature={temperature} setTemperature={setTemperature}
                        fpTotalTimeS={fpTotalTimeS} setFpTotalTimeS={setFpTotalTimeS}
                        setRoast={setRoast}
                        setProcess={setProcess}
                    />
                )}

                {method === "aeropress" && (
                    <AeropressControls
                        dict={dict}
                        advancedMode={advancedMode}
                        grind={grind} setGrind={setGrind}
                        ratio={ratio} setRatio={setRatio}
                        temperature={temperature} setTemperature={setTemperature}
                        aeroTotalTimeS={aeroTotalTimeS} setAeroTotalTimeS={setAeroTotalTimeS}
                        aeroPressureLevel={aeroPressureLevel} setAeroPressureLevel={setAeroPressureLevel}
                        aeroInverted={aeroInverted} setAeroInverted={setAeroInverted}
                        setRoast={setRoast}
                        setProcess={setProcess}
                    />
                )}

                {method === "moka" && (
                    <MokaControls
                        dict={dict}
                        advancedMode={advancedMode}
                        grind={grind} setGrind={setGrind}
                        ratio={ratio} setRatio={setRatio}
                        mokaHeatLevel={mokaHeatLevel} setMokaHeatLevel={setMokaHeatLevel}
                        mokaWaterTempC={mokaWaterTempC} setMokaWaterTempC={setMokaWaterTempC}
                        setRoast={setRoast}
                        setProcess={setProcess}
                    />
                )}

                {method === "cold_brew" && (
                    <ColdBrewControls
                        dict={dict}
                        grind={grind} setGrind={setGrind}
                        ratio={ratio} setRatio={setRatio}
                        coldBrewTotalTimeH={coldBrewTotalTimeH} setColdBrewTotalTimeH={setColdBrewTotalTimeH}
                        fridgeTempC={coldBrewFridgeTempC} setFridgeTempC={setColdBrewFridgeTempC}
                        setRoast={setRoast}
                        setProcess={setProcess}
                    />
                )}

                {/* Agua (avanzado, compartido por todos los métodos) */}
                {advancedMode && useWater && (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-200">{dict.waterLabel}</span>
                            <span className="text-neutral-200">GH {waterGH} · KH {waterKH}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-neutral-400">GH</span>
                                    <span className="text-neutral-400">{waterGH}</span>
                                </div>
                                <input
                                    className="mt-1 w-full accent-neutral-200"
                                    type="range" min={1} max={12} step={1}
                                    value={waterGH}
                                    onChange={(e) => setWaterGH(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-neutral-400">KH</span>
                                    <span className="text-neutral-400">{waterKH}</span>
                                </div>
                                <input
                                    className="mt-1 w-full accent-neutral-200"
                                    type="range" min={0} max={8} step={1}
                                    value={waterKH}
                                    onChange={(e) => setWaterKH(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Presets rápidos */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <p className="mb-3 text-xs text-neutral-400">{dict.quickPresets}</p>
                    <div className="flex flex-wrap gap-2">
                        {method === "espresso" && (<>
                            <button type="button" onClick={() => { setGrind(70); setRatio(1.6); setRoast("claro"); setProcess("lavado"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_lightRistretto}</button>
                            <button type="button" onClick={() => { setGrind(60); setRatio(2.0); setRoast("medio"); setProcess("lavado"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_classicEspresso}</button>
                            <button type="button" onClick={() => { setGrind(50); setRatio(2.8); setRoast("medio"); setProcess("natural"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_naturalLungo}</button>
                        </>)}
                        {method === "v60" && (<>
                            <button type="button" onClick={() => { setGrind(75); setRatio(16); setRoast("claro"); setProcess("lavado"); setTemperature(92); setV60TotalTimeS(240); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_v60_lightWashed}</button>
                            <button type="button" onClick={() => { setGrind(70); setRatio(15); setRoast("medio"); setProcess("lavado"); setTemperature(93); setV60TotalTimeS(210); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_v60_standard}</button>
                            <button type="button" onClick={() => { setGrind(72); setRatio(15); setRoast("claro"); setProcess("natural"); setTemperature(91); setV60TotalTimeS(240); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_v60_fruityNatural}</button>
                        </>)}
                        {method === "french_press" && (<>
                            <button type="button" onClick={() => { setGrind(35); setRatio(16); setRoast("claro"); setProcess("lavado"); setTemperature(91); setFpTotalTimeS(200); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_fp_gentleMorning}</button>
                            <button type="button" onClick={() => { setGrind(40); setRatio(14); setRoast("medio"); setProcess("lavado"); setTemperature(93); setFpTotalTimeS(240); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_fp_classic}</button>
                            <button type="button" onClick={() => { setGrind(45); setRatio(12); setRoast("oscuro"); setProcess("natural"); setTemperature(94); setFpTotalTimeS(270); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_fp_intenseNatural}</button>
                        </>)}
                        {method === "aeropress" && (<>
                            <button type="button" onClick={() => { setGrind(70); setRatio(7); setTemperature(85); setAeroTotalTimeS(60); setAeroPressureLevel(4); setAeroInverted(false); setRoast("medio"); setProcess("lavado"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_aero_quickExpress}</button>
                            <button type="button" onClick={() => { setGrind(60); setRatio(10); setTemperature(88); setAeroTotalTimeS(120); setAeroPressureLevel(3); setAeroInverted(true); setRoast("claro"); setProcess("natural"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_aero_longInverted}</button>
                            <button type="button" onClick={() => { setGrind(75); setRatio(6); setTemperature(90); setAeroTotalTimeS(90); setAeroPressureLevel(5); setAeroInverted(false); setRoast("oscuro"); setProcess("lavado"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_aero_boldStrong}</button>
                        </>)}
                        {method === "moka" && (<>
                            <button type="button" onClick={() => { setGrind(75); setRatio(8); setMokaHeatLevel(2); setMokaWaterTempC(20); setRoast("medio"); setProcess("honey"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_moka_gentle}</button>
                            <button type="button" onClick={() => { setGrind(80); setRatio(7); setMokaHeatLevel(3); setMokaWaterTempC(20); setRoast("oscuro"); setProcess("lavado"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_moka_classic}</button>
                            <button type="button" onClick={() => { setGrind(85); setRatio(6); setMokaHeatLevel(4); setMokaWaterTempC(60); setRoast("oscuro"); setProcess("natural"); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_moka_intense}</button>
                        </>)}
                        {method === "cold_brew" && (<>
                            <button type="button" onClick={() => { setGrind(35); setRatio(5); setColdBrewTotalTimeH(18); setRoast("oscuro"); setProcess("lavado"); setColdBrewFridgeTempC(4); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_cb_darkConcentrate}</button>
                            <button type="button" onClick={() => { setGrind(45); setRatio(8); setColdBrewTotalTimeH(16); setRoast("medio"); setProcess("lavado"); setColdBrewFridgeTempC(4); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_cb_standard}</button>
                            <button type="button" onClick={() => { setGrind(50); setRatio(8); setColdBrewTotalTimeH(20); setRoast("claro"); setProcess("natural"); setColdBrewFridgeTempC(3); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800">{dict.preset_cb_fruityNatural}</button>
                        </>)}
                    </div>
                </div>

                {/* Tipo de café (compartido) */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-sm font-medium">{dict.coffeeType}</span>
                        <span className="text-xs text-neutral-200">{roastLabel} · {processLabel}</span>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="text-xs text-neutral-400">
                            {dict.roastLabel}
                            <select
                                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none"
                                value={roast}
                                onChange={(e) => setRoast(e.target.value as Roast)}
                            >
                                <option value="claro">{dict.roast_light}</option>
                                <option value="medio">{dict.roast_medium}</option>
                                <option value="oscuro">{dict.roast_dark}</option>
                            </select>
                        </label>
                        <label className="text-xs text-neutral-400">
                            {dict.processLabel}
                            <select
                                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none"
                                value={process}
                                onChange={(e) => setProcess(e.target.value as Process)}
                            >
                                <option value="lavado">{dict.process_washed}</option>
                                <option value="natural">{dict.process_natural}</option>
                                <option value="honey">{dict.process_honey}</option>
                            </select>
                        </label>
                    </div>
                    <p className="mt-3 text-xs text-neutral-500">{dict.roastAdvice}</p>
                </div>

            </div>
        </div>
    );
}
