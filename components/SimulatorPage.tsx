"use client";

import ExtractionMap from "./ExtractionMap";
import FlavorRadar from "./FlavorRadar";
import { useEffect, useMemo, useState } from "react";
import { simulateEspresso, type Process, type Roast } from "../engine/espressoEngine";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import type { Dict } from "../lib/getDictionary";

function fmtRatio(r: number) {
    return `1:${r.toFixed(1)}`;
}

export default function SimulatorPage({
    dict,
    locale,
}: {
    dict: Dict;
    locale: "es" | "en";
}) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [grind, setGrind] = useState(55);
    const [ratio, setRatio] = useState(2.0);
    const [roast, setRoast] = useState<Roast>("claro");
    const [process, setProcess] = useState<Process>("lavado");
    const [recipeName, setRecipeName] = useState("");
    const [copied, setCopied] = useState(false);

    const [advancedMode, setAdvancedMode] = useState(false);
    const [useTemperature, setUseTemperature] = useState(false);
    const [usePressure, setUsePressure] = useState(false);
    const [useWater, setUseWater] = useState(false);

    const [temperature, setTemperature] = useState(93);
    const [pressure, setPressure] = useState(9);
    const [waterGH, setWaterGH] = useState(6);
    const [waterKH, setWaterKH] = useState(3);
    const [isSwitchingLocale, setIsSwitchingLocale] = useState(false);

    const doseG = 18;

    useEffect(() => {
        const g = searchParams.get("grind");
        const r = searchParams.get("ratio");
        const ro = searchParams.get("roast");
        const pr = searchParams.get("process");
        const nm = searchParams.get("name");
        const t = searchParams.get("temperature");
        const p = searchParams.get("pressure");
        const gh = searchParams.get("waterGH");
        const kh = searchParams.get("waterKH");

        if (nm !== null) {
            setRecipeName(nm);
        }

        if (g !== null) {
            const n = Number(g);
            if (!Number.isNaN(n)) setGrind(Math.max(0, Math.min(100, Math.round(n))));
        }

        if (r !== null) {
            const n = Number(r);
            if (!Number.isNaN(n)) setRatio(Math.max(1.0, Math.min(3.2, Number(n.toFixed(1)))));
        }

        if (ro === "claro" || ro === "medio" || ro === "oscuro") setRoast(ro);
        if (pr === "lavado" || pr === "natural" || pr === "honey") setProcess(pr);

        if (t !== null) {
            const n = Number(t);
            if (!Number.isNaN(n)) {
                setTemperature(Math.max(88, Math.min(98, n)));
                setAdvancedMode(true);
                setUseTemperature(true);
            }
        }

        if (p !== null) {
            const n = Number(p);
            if (!Number.isNaN(n)) {
                setPressure(Math.max(6, Math.min(10, n)));
                setAdvancedMode(true);
                setUsePressure(true);
            }
        }

        if (gh !== null) {
            const n = Number(gh);
            if (!Number.isNaN(n)) {
                setWaterGH(Math.max(1, Math.min(12, n)));
                setAdvancedMode(true);
                setUseWater(true);
            }
        }

        if (kh !== null) {
            const n = Number(kh);
            if (!Number.isNaN(n)) {
                setWaterKH(Math.max(0, Math.min(8, n)));
                setAdvancedMode(true);
                setUseWater(true);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (isSwitchingLocale) return;
        const qs = new URLSearchParams();
        qs.set("grind", String(grind));
        qs.set("ratio", ratio.toFixed(1));
        qs.set("roast", roast);
        qs.set("process", process);

        if (recipeName.trim()) {
            qs.set("name", recipeName.trim());
        }

        if (advancedMode && useTemperature) {
            qs.set("temperature", String(temperature));
        }

        if (advancedMode && usePressure) {
            qs.set("pressure", String(pressure));
        }

        if (advancedMode && useWater) {
            qs.set("waterGH", String(waterGH));
            qs.set("waterKH", String(waterKH));
        }

        const newUrl = `${window.location.pathname}?${qs.toString()}`;
        window.history.replaceState(null, "", newUrl);
    }, [
        grind,
        ratio,
        roast,
        process,
        recipeName,
        advancedMode,
        useTemperature,
        temperature,
        usePressure,
        pressure,
        useWater,
        waterGH,
        waterKH,
    ]);

    useEffect(() => {
        setIsSwitchingLocale(false);
    }, [locale]);

    const result = useMemo(
        () =>
            simulateEspresso({
                grind,
                ratio,
                doseG,
                roast,
                process,
                temperatureC: advancedMode && useTemperature ? temperature : undefined,
                pressureBar: advancedMode && usePressure ? pressure : undefined,
                waterGH: advancedMode && useWater ? waterGH : undefined,
                waterKH: advancedMode && useWater ? waterKH : undefined,
            }),
        [
            grind,
            ratio,
            doseG,
            roast,
            process,
            advancedMode,
            useTemperature,
            temperature,
            usePressure,
            pressure,
            useWater,
            waterGH,
            waterKH,
        ]
    );

    const stateLabel =
        result.state === "Subextraído"
            ? dict.state_under
            : result.state === "Balanceado"
                ? dict.state_balanced
                : dict.state_over0;

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-50">
            <section className="mx-auto max-w-screen-2xl px-6 pt-16 pb-10">
                <div className="max-w-8xl">
                    <p className="text-sm text-neutral-400">{dict.heroTagline}</p>

                    <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                        {recipeName ? (
                            <>
                                <span className="block">{recipeName}</span>
                                <span className="mt-3 block text-base text-neutral-300 sm:text-lg">
                                    {dict.espressoSimulation}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="block">{dict.title}</span>
                                <span className="block text-neutral-300">{dict.title2}</span>
                                <span className="block text-neutral-300">{dict.title3}</span>
                            </>
                        )}
                    </h1>

                    <p className="mt-4 text-base text-neutral-300 sm:text-lg">{dict.subtitle}</p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        {[
                            dict.chip_espresso,
                            dict.chip_grind,
                            dict.chip_ratio,
                            dict.chip_roast,
                            dict.chip_process,
                        ].map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200"
                            >
                                {t}
                            </span>
                        ))}

                        <span className="ml-1 text-xs text-neutral-500">{dict.languageLabel}:</span>

                        <button
                            type="button"
                            onClick={() => {
                                setIsSwitchingLocale(true);
                                const targetLocale = locale === "es" ? "en" : "es";
                                const qs = searchParams.toString();
                                router.push(`/${targetLocale}${qs ? `?${qs}` : ""}`);
                            }}
                            className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                        >
                            {locale === "es" ? dict.lang_en : dict.lang_es}
                        </button>
                    </div>

                    <a
                        href="#simulador"
                        className="mt-8 inline-flex items-center justify-center rounded-xl bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-950 hover:bg-white"
                    >
                        {dict.tryNow}
                    </a>
                </div>
            </section>

            <section id="simulador" className="mx-auto max-w-screen-2xl px-6 pb-20">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Resultado */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {recipeName ? recipeName : dict.result}
                                </h2>

                                <p className="mt-1 text-sm text-neutral-400">
                                    {dict.statusLabel}:{" "}
                                    <span className="text-neutral-200">{stateLabel}</span>
                                    <span className="text-neutral-500"> · </span>
                                    {dict.styleLabel}:{" "}
                                    <span className="text-neutral-200">{result.styleHint}</span>
                                </p>

                                <p className="mt-2 text-xs text-neutral-500">
                                    {result.styleHint === "Ristretto" && dict.style_ristretto_desc}
                                    {result.styleHint === "Espresso" && dict.style_espresso_desc}
                                    {result.styleHint === "Lungo" && dict.style_lungo_desc}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className="rounded-full border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200">
                                    {doseG}g → {result.beverageG}g ({fmtRatio(ratio)})
                                </span>

                                <p className="text-xs text-neutral-400">
                                    {dict.estimatedTime}: {result.estimatedTimeS}s
                                </p>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        const url = window.location.href;
                                        await navigator.clipboard.writeText(url);
                                        setCopied(true);
                                        window.setTimeout(() => setCopied(false), 1500);
                                    }}
                                    className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                                >
                                    {copied ? dict.copied : dict.copyLink}
                                </button>

                                <div className="mt-3 flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={dict.recipeNamePlaceholder}
                                        className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 outline-none"
                                        value={recipeName}
                                        onChange={(e) => setRecipeName(e.target.value)}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const qs = new URLSearchParams(searchParams.toString());
                                            if (recipeName.trim()) {
                                                qs.set("name", recipeName.trim());
                                            } else {
                                                qs.delete("name");
                                            }
                                            router.push(`/${locale}?${qs.toString()}`);
                                        }}
                                        className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                                    >
                                        {dict.save}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {recipeName ? (
                            <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/30 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-100">{recipeName}</p>
                                        <p className="mt-1 text-xs text-neutral-400">
                                            {result.styleHint} · {roast} · {process}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-neutral-400">
                                            {doseG}g → {result.beverageG}g ({fmtRatio(ratio)})
                                        </p>
                                        <p className="mt-1 text-xs text-neutral-300">{result.state}</p>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-neutral-300">{dict.flavorProfile}</p>
                                    <p className="mt-1 text-xs text-neutral-500">{dict.axesLabel}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-neutral-400">{dict.estimatedExtraction}</p>
                                    <p className="text-sm text-neutral-200">
                                        {Math.round(result.extraction)}/100
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4 lg:grid lg:h-96 lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                                <ExtractionMap
                                    grind={grind}
                                    ratio={ratio}
                                    state={result.state}
                                    styleHint={result.styleHint}
                                />

                                <FlavorRadar axes={result.axes} />
                            </div>

                            <p className="mt-2 text-[11px] text-neutral-400 lg:mt-4 lg:text-xs">
                                {result.state === "Subextraído" && dict.state_sub}
                                {result.state === "Balanceado" && dict.state_bal}
                                {result.state === "Sobreextraído" && dict.state_over}
                            </p>
                        </div>

                        <p className="mt-6 text-xs text-neutral-500">{dict.note}</p>
                    </div>

                    {/* Controles */}
                    <div className="rounded-2xl border border-neutral-600 bg-neutral-900/40 p-6">
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

                        <p className="mt-1 text-sm text-neutral-400">{dict.controlsDescription}</p>

                        <div className="mt-6 space-y-5">
                            {/* Molienda */}
                            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{dict.grindLabel}</span>
                                    <span className="text-xs text-neutral-400">{grind}/100</span>
                                </div>
                                <input
                                    className="mt-3 w-full accent-neutral-200"
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={grind}
                                    onChange={(e) => setGrind(Number(e.target.value))}
                                />
                                <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
                                    <span>{dict.grindCoarse}</span>
                                    <span>{dict.grindFine}</span>
                                </div>
                            </div>

                            {/* Ratio */}
                            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{dict.ratioLabel}</span>
                                    <span className="text-xs text-neutral-400">{fmtRatio(ratio)}</span>
                                </div>
                                <input
                                    className="mt-3 w-full accent-neutral-200"
                                    type="range"
                                    min={1.0}
                                    max={3.2}
                                    step={0.1}
                                    value={ratio}
                                    onChange={(e) => setRatio(Number(e.target.value))}
                                />
                                <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
                                    <span>{dict.ratioShort}</span>
                                    <span>{dict.ratioLong}</span>
                                </div>
                            </div>

                            {/* Temperatura */}
                            {advancedMode && useTemperature && (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{dict.temperatureLabel}</span>
                                        <span className="text-xs text-neutral-400">{temperature}°C</span>
                                    </div>

                                    <input
                                        className="mt-3 w-full accent-neutral-200"
                                        type="range"
                                        min={88}
                                        max={98}
                                        step={1}
                                        value={temperature}
                                        onChange={(e) => setTemperature(Number(e.target.value))}
                                    />

                                    <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
                                        <span>88°C</span>
                                        <span>98°C</span>
                                    </div>
                                </div>
                            )}

                            {/* Presión */}
                            {advancedMode && usePressure && (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{dict.pressureLabel}</span>
                                        <span className="text-xs text-neutral-400">{pressure} bar</span>
                                    </div>

                                    <input
                                        className="mt-3 w-full accent-neutral-200"
                                        type="range"
                                        min={6}
                                        max={10}
                                        step={0.5}
                                        value={pressure}
                                        onChange={(e) => setPressure(Number(e.target.value))}
                                    />

                                    <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
                                        <span>6 bar</span>
                                        <span>10 bar</span>
                                    </div>
                                </div>
                            )}

                            {/* Agua */}
                            {advancedMode && useWater && (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{dict.waterLabel}</span>
                                        <span className="text-xs text-neutral-400">
                                            GH {waterGH} · KH {waterKH}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">GH</span>
                                            <span className="text-xs text-neutral-400">{waterGH}</span>
                                        </div>

                                        <input
                                            className="mt-2 w-full accent-neutral-200"
                                            type="range"
                                            min={1}
                                            max={12}
                                            step={1}
                                            value={waterGH}
                                            onChange={(e) => setWaterGH(Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">KH</span>
                                            <span className="text-xs text-neutral-400">{waterKH}</span>
                                        </div>

                                        <input
                                            className="mt-2 w-full accent-neutral-200"
                                            type="range"
                                            min={0}
                                            max={8}
                                            step={1}
                                            value={waterKH}
                                            onChange={(e) => setWaterKH(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tipo de café */}
                            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{dict.coffeeType}</span>
                                    <span className="text-xs text-neutral-500">
                                        {roast} · {process}
                                    </span>
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

                            {/* Presets rápidos */}
                            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                <p className="mb-3 text-xs text-neutral-400">{dict.quickPresets}</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGrind(70);
                                            setRatio(1.6);
                                            setRoast("claro");
                                            setProcess("lavado");
                                        }}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800"
                                    >
                                        {dict.preset_lightRistretto}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGrind(60);
                                            setRatio(2.0);
                                            setRoast("medio");
                                            setProcess("lavado");
                                        }}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800"
                                    >
                                        {dict.preset_classicEspresso}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGrind(50);
                                            setRatio(2.8);
                                            setRoast("medio");
                                            setProcess("natural");
                                        }}
                                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs transition hover:bg-neutral-800"
                                    >
                                        {dict.preset_naturalLungo}
                                    </button>
                                </div>
                            </div>

                            {/* Parámetros avanzados */}
                            {advancedMode && (
                                <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                    <p className="mb-3 text-xs text-neutral-400">
                                        {dict.advancedParameters}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setUseTemperature(!useTemperature)}
                                            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs hover:bg-neutral-800"
                                        >
                                            {dict.addTemperature}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setUsePressure(!usePressure)}
                                            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs hover:bg-neutral-800"
                                        >
                                            {dict.addPressure}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setUseWater(!useWater)}
                                            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs hover:bg-neutral-800"
                                        >
                                            {dict.addWater}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}