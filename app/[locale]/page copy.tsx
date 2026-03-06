"use client";

import ExtractionMap from "../../components/ExtractionMap";
import FlavorRadar from "../../components/FlavorRadar";
import { useEffect, useMemo, useState } from "react";
import {
  simulateEspresso,
  type Process,
  type Roast,
} from "../../engine/espressoEngine";
import { useSearchParams } from "next/navigation";

function fmtRatio(r: number) {
  return `1:${r.toFixed(1)}`;
}

export default function Home() {
  const searchParams = useSearchParams();
  const [grind, setGrind] = useState(55); // 0..100
  const [ratio, setRatio] = useState(2.0); // 1.0..3.2
  const [roast, setRoast] = useState<Roast>("claro");
  const [process, setProcess] = useState<Process>("lavado");
  useEffect(() => {

    // Solo aplica si hay parámetros
    const g = searchParams.get("grind");
    const r = searchParams.get("ratio");
    const ro = searchParams.get("roast");
    const pr = searchParams.get("process");

    if (g !== null) {
      const n = Number(g);
      if (!Number.isNaN(n)) setGrind(Math.max(0, Math.min(100, Math.round(n))));
    }

    if (r !== null) {
      const n = Number(r);
      if (!Number.isNaN(n)) setRatio(Math.max(1.0, Math.min(3.2, Number(n.toFixed(1)))));
    }

    if (ro === "claro" || ro === "medio" || ro === "oscuro") {
      setRoast(ro);
    }

    if (pr === "lavado" || pr === "natural" || pr === "honey") {
      setProcess(pr);
    }
    // Importante: solo depende de searchParams
  }, [searchParams]);

  useEffect(() => {
    // Mantener URL sincronizada con el estado (sin recargar)
    const qs = new URLSearchParams();
    qs.set("grind", String(grind));
    qs.set("ratio", ratio.toFixed(1));
    qs.set("roast", roast);
    qs.set("process", process);

    const newUrl = `${window.location.pathname}?${qs.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [grind, ratio, roast, process]);

  const doseG = 18;

  const result = useMemo(
    () => simulateEspresso({ grind, ratio, doseG, roast, process }),
    [grind, ratio, doseG, roast, process]
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="max-w-3xl">
          <p className="text-sm text-neutral-400">
            Simulador (MVP) · Espresso · Perfil sensorial
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Mueve la molienda y el ratio.
            <span className="text-neutral-300"> Mira cómo cambia el sabor.</span>
          </h1>
          <p className="mt-4 text-base text-neutral-300 sm:text-lg">
            Predicción orientativa basada en teoría de extracción. Ideal para
            entender si tu receta tenderá a más acidez, más amargor o más cuerpo.
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
            Probar ahora
          </a>
        </div>
      </section>

      {/* Simulador */}
      <section id="simulador" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controles */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <h2 className="text-lg font-semibold">Controles</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Ajusta la receta y el tipo de café. El resultado se actualiza en
              tiempo real.
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
                  Consejo: tuestes claros suelen castigar más la subextracción;
                  tuestes oscuros suben el amargor antes.
                </p>
              </div>

              {/* Presets rápidos */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                <p className="text-xs text-neutral-400 mb-3">Presets rápidos</p>
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

            </div>
          </div>

          {/* Resultado */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Resultado</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Estado: <span className="text-neutral-200">{result.state}</span>
                  <span className="text-neutral-500"> · </span>
                  Estilo: <span className="text-neutral-200">{result.styleHint}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200">
                  {doseG}g → {result.beverageG}g ({fmtRatio(ratio)})
                </span>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const url = window.location.href;
                      await navigator.clipboard.writeText(url);
                      alert("Enlace copiado");
                    } catch {
                      alert("No se pudo copiar el enlace");
                    }
                  }}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                >
                  Copiar enlace
                </button>
              </div>

            </div>

            <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-300">Perfil sensorial</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Acidez · Dulzor · Amargor · Astringencia · Cuerpo
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400">Extracción estimada</p>
                  <p className="text-sm text-neutral-200">
                    {Math.round(result.extraction)}/100
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                <ExtractionMap
                  grind={grind}
                  ratio={ratio}
                  state={result.state}
                  styleHint={result.styleHint}
                />
                <FlavorRadar axes={result.axes} />
              </div>
              <p className="mt-4 text-xs text-neutral-300">
                {result.state === "Subextraído" &&
                  "Probablemente percibirás acidez marcada y cuerpo ligero. Prueba moler más fino o alargar ligeramente el ratio."}

                {result.state === "Balanceado" &&
                  "Zona dulce de extracción: mayor dulzor y claridad en la taza."}

                {result.state === "Sobreextraído" &&
                  "Probablemente aparecerá amargor o astringencia. Intenta moler más grueso o acortar el ratio."}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-neutral-300">
                {(
                  [
                    ["Acidez", result.axes.acidez],
                    ["Dulzor", result.axes.dulzor],
                    ["Amargor", result.axes.amargor],
                    ["Astringencia", result.axes.astringencia],
                    ["Cuerpo", result.axes.cuerpo],
                  ] as const
                ).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span>{k}</span>
                      <span className="text-neutral-400">{v}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-neutral-800">
                      <div
                        className="h-2 rounded-full bg-neutral-200"
                        style={{ width: `${v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mini explicación */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Subextraído", "Más acidez punzante, notas verdes, cuerpo ligero."],
            ["Balanceado", "Más dulzor y claridad, sensación redonda."],
            ["Sobreextraído", "Más amargor y astringencia, final seco."],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5"
            >
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-neutral-500">
          Nota: esto es una heurística educativa, no una medición física real.
        </p>
      </section>
    </main>
  );
}