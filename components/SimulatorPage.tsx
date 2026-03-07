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
    const doseG = 18;
    const [advancedMode, setAdvancedMode] = useState(false);
    const [useTemperature, setUseTemperature] = useState(false);
    const [usePressure, setUsePressure] = useState(false);
    const [useWater, setUseWater] = useState(false);
    const [temperature, setTemperature] = useState(93);
    const [pressure, setPressure] = useState(9);
    const [waterGH, setWaterGH] = useState(6);
    const [waterKH, setWaterKH] = useState(3);

    // Leer URL al cargar / cuando cambia la query
    useEffect(() => {
        const g = searchParams.get("grind");
        const r = searchParams.get("ratio");
        const ro = searchParams.get("roast");
        const pr = searchParams.get("process");
        const nm = searchParams.get("name");
        const name = searchParams.get("name");
        if (name !== null) {
            setRecipeName(name);
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
        if (nm !== null) setRecipeName(nm);
    }, [searchParams]);

    // Mantener URL sincronizada con el estado
    useEffect(() => {
        const qs = new URLSearchParams();
        qs.set("grind", String(grind));
        qs.set("ratio", ratio.toFixed(1));
        qs.set("roast", roast);
        qs.set("process", process);


        const newUrl = `${window.location.pathname}?${qs.toString()}`;
        window.history.replaceState(null, "", newUrl);
    }, [grind, ratio, roast, process]);

    const result = useMemo(
        () => simulateEspresso({ grind, ratio, doseG, roast, process }),
        [grind, ratio, doseG, roast, process]
    );

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-50">
            {/* Hero */}
            <section className="mx-auto max-w-screen-2xl px-6 pt-16 pb-10">
                <div className="max-w-3xl">
                    <p className="text-sm text-neutral-400">
                        Simulador (MVP) · Espresso · Perfil sensorial
                    </p>

                    <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                        {recipeName ? (
                            <>
                                {recipeName}
                                <span className="block text-neutral-300 text-base sm:text-lg mt-3">
                                    {locale === "es" ? "Simulación de espresso" : "Espresso simulation"}
                                </span>
                            </>
                        ) : (
                            <>
                                {dict.title} <span className="text-neutral-300">{dict.title2}</span>
                            </>
                        )}
                    </h1>

                    <p className="mt-4 text-base text-neutral-300 sm:text-lg">
                        {dict.subtitle}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {["Espresso", "Molienda", "Ratio", "Tueste", "Proceso"].map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200"
                            >
                                {t}
                            </span>
                        ))}
                    </div>

                    <a
                        href="#simulador"
                        className="mt-8 inline-flex items-center justify-center rounded-xl bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-950 hover:bg-white"
                    >
                        {dict.tryNow}
                        <div className="mt-6 flex items-center gap-2 text-xs">
                            <span className="text-neutral-500">Idioma:</span>

                            // botón cambiar de idioma
                            <button
                                type="button"
                                onClick={() => {
                                    const targetLocale = locale === "es" ? "en" : "es";
                                    const qs = searchParams.toString();
                                    router.push(`/${targetLocale}${qs ? `?${qs}` : ""}`);
                                }}
                                className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-1 text-neutral-200 hover:bg-neutral-900"
                            >
                                {locale === "es" ? dict.lang_en : dict.lang_es}
                            </button>
                        </div>
                    </a>
                </div>
            </section>

            {/* Simulador */}
            <section id="simulador" className="mx-auto max-w-screen-2xl px-6 pb-20">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Controles */}
                    <div className="rounded-2xl border border-neutral-600 bg-neutral-900/40 p-6">
                        <h2 className="text-lg font-semibold">{dict.controls}</h2>
                        <button
                            type="button"
                            onClick={() => setAdvancedMode(!advancedMode)}
                            className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                        >
                            {advancedMode
                                ? (locale === "es" ? "Ocultar modo avanzado" : "Hide advanced mode")
                                : (locale === "es" ? "Modo avanzado" : "Advanced mode")}
                        </button>
                        <p className="mt-1 text-sm text-neutral-400">
                            Ajusta la receta y el tipo de café. El resultado se actualiza en tiempo real.
                        </p>

                        <div className="mt-6 space-y-5">
                            {/* Molienda */}
                            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Molienda</span>
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
                                    <span>gruesa</span>
                                    <span>fina</span>
                                </div>
                            </div>

                            {/* Ratio */}
                            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Ratio</span>
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
                                    <span>corto</span>
                                    <span>largo</span>
                                </div>
                            </div>
                            {advancedMode && useTemperature && (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {locale === "es" ? "Temperatura" : "Temperature"}
                                        </span>
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
                            {advancedMode && usePressure && (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {locale === "es" ? "Presión" : "Pressure"}
                                        </span>
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
                            {advancedMode && useWater && (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {locale === "es" ? "Agua" : "Water"}
                                        </span>
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
                                    <span className="text-sm font-medium">Tipo de café</span>
                                    <span className="text-xs text-neutral-500">
                                        {roast} · {process}
                                    </span>
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <label className="text-xs text-neutral-400">
                                        Tueste
                                        <select
                                            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none"
                                            value={roast}
                                            onChange={(e) => setRoast(e.target.value as Roast)}
                                        >
                                            <option value="claro">claro</option>
                                            <option value="medio">medio</option>
                                            <option value="oscuro">oscuro</option>
                                        </select>
                                    </label>

                                    <label className="text-xs text-neutral-400">
                                        Proceso
                                        <select
                                            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none"
                                            value={process}
                                            onChange={(e) => setProcess(e.target.value as Process)}
                                        >
                                            <option value="lavado">lavado</option>
                                            <option value="natural">natural</option>
                                            <option value="honey">honey</option>
                                        </select>
                                    </label>
                                </div>

                                <p className="mt-3 text-xs text-neutral-500">
                                    Consejo: tuestes claros suelen castigar más la subextracción; tuestes oscuros suben el amargor antes.
                                </p>
                            </div>

                            {/* Presets rápidos */}
                            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                <p className="text-xs text-neutral-400 mb-3">{dict.quickPresets}</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGrind(70);
                                            setRatio(1.6);
                                            setRoast("claro");
                                            setProcess("lavado");
                                        }}
                                        className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition"
                                    >
                                        Ristretto claro
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGrind(60);
                                            setRatio(2.0);
                                            setRoast("medio");
                                            setProcess("lavado");
                                        }}
                                        className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition"
                                    >
                                        Espresso clásico
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGrind(50);
                                            setRatio(2.8);
                                            setRoast("medio");
                                            setProcess("natural");
                                        }}
                                        className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition"
                                    >
                                        Lungo natural
                                    </button>
                                </div>
                            </div>
                            {advancedMode && (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 mt-4">
                                    <p className="text-xs text-neutral-400 mb-3">
                                        {locale === "es" ? "Parámetros avanzados" : "Advanced parameters"}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setUseTemperature(!useTemperature)}
                                            className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg bg-neutral-900 hover:bg-neutral-800"
                                        >
                                            {locale === "es" ? "Añadir temperatura" : "Add temperature"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setUsePressure(!usePressure)}
                                            className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg bg-neutral-900 hover:bg-neutral-800"
                                        >
                                            {locale === "es" ? "Añadir presión" : "Add pressure"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setUseWater(!useWater)}
                                            className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg bg-neutral-900 hover:bg-neutral-800"
                                        >
                                            {locale === "es" ? "Añadir agua" : "Add water"}
                                        </button>

                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resultado */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {recipeName ? recipeName : dict.result}
                                </h2>
                                <p className="mt-1 text-sm text-neutral-400">
                                    Estado: <span className="text-neutral-200">{result.state}</span>
                                    <span className="text-neutral-500"> · </span>
                                    Estilo: <span className="text-neutral-200">{result.styleHint}</span>
                                </p>
                                <p className="mt-2 text-xs text-neutral-500">
                                    {result.styleHint === "Ristretto" &&
                                        (locale === "es"
                                            ? "Más corto y concentrado: más intensidad y cuerpo, menos claridad."
                                            : "Shorter and more concentrated: more intensity and body, less clarity.")}

                                    {result.styleHint === "Espresso" &&
                                        (locale === "es"
                                            ? "Equilibrio clásico: buena mezcla entre intensidad, dulzor y claridad."
                                            : "Classic balance: a good mix of intensity, sweetness and clarity.")}

                                    {result.styleHint === "Lungo" &&
                                        (locale === "es"
                                            ? "Más largo: suele ganar claridad, pero sube el riesgo de amargor/astringencia."
                                            : "Longer: often more clarity, but higher risk of bitterness/astringency.")}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className="rounded-full border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200">
                                    {doseG}g → {result.beverageG}g ({fmtRatio(ratio)})
                                    <p className="mt-1 text-xs text-neutral-400">
                                        {locale === "es" ? "Tiempo estimado" : "Estimated time"}: {result.estimatedTimeS}s
                                    </p>
                                </span>

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
                                    {copied ? (locale === "es" ? "¡Copiado!" : "Copied!") : dict.copyLink}
                                </button>
                                <div className="mt-3 flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={locale === "es" ? "Nombre de la receta" : "Recipe name"}
                                        className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 outline-none"
                                        value={recipeName}
                                        onChange={(e) => setRecipeName(e.target.value)}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const qs = new URLSearchParams(searchParams.toString());
                                            qs.set("name", recipeName);
                                            router.push(`/${locale}?${qs.toString()}`);
                                        }}
                                        className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                                    >
                                        {locale === "es" ? "Guardar" : "Save"}
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
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Acidez · Dulzor · Amargor · Astringencia · Cuerpo
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-neutral-400">{dict.estimatedExtraction}</p>
                                    <p className="text-sm text-neutral-200">
                                        {Math.round(result.extraction)}/100
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 h-96 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                                <ExtractionMap
                                    grind={grind}
                                    ratio={ratio}
                                    state={result.state}
                                    styleHint={result.styleHint}
                                />
                                <FlavorRadar axes={result.axes} />
                            </div>

                            <p className="mt-4 text-xs text-neutral-400">
                                {result.state === "Subextraído" && dict.state_sub}
                                {result.state === "Balanceado" && dict.state_bal}
                                {result.state === "Sobreextraído" && dict.state_over}
                            </p>
                        </div>

                        <p className="mt-6 text-xs text-neutral-500">{dict.note}</p>
                    </div>
                </div>
            </section>
        </main>
    );
}