"use client";

import type { Dict } from "../lib/getDictionary";
import type { BrewMethod } from "./types/brew";
import type { ReadonlyURLSearchParams } from "next/navigation";

type Props = {
    dict: Dict;
    locale: "es" | "en";
    method: BrewMethod;
    setMethod: (value: BrewMethod) => void;
    searchParams: ReadonlyURLSearchParams;
    copied: boolean;
    setCopied: (value: boolean) => void;
    recipeName: string;
    setRecipeName: (value: string) => void;
    handleSaveRecipe: () => void;
    saveMessage: string;
};

export default function SimulatorHero({
    dict,
    locale,
    method,
    setMethod,
    searchParams,
    copied,
    setCopied,
    recipeName,
    setRecipeName,
    handleSaveRecipe,
    saveMessage,
}: Props) {
    return (
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
                        dict.chip_grind,
                        dict.chip_ratio,
                        dict.chip_roast,
                        dict.chip_process,
                        dict.chip_temperature,
                        dict.chip_water,
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
                            const targetLocale = locale === "es" ? "en" : "es";
                            const qs = searchParams.toString();
                            window.location.href = `/${targetLocale}${qs ? `?${qs}` : ""}`;
                        }}
                        className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                    >
                        {locale === "es" ? dict.lang_en : dict.lang_es}
                    </button>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <a
                            href="#simulador"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-950 hover:bg-white"
                        >
                            {dict.tryNow}
                        </a>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value as BrewMethod)}
                            className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm text-neutral-100 outline-none"
                        >
                            <option value="espresso">Espresso</option>
                            <option value="v60">V60</option>
                            <option value="french_press">French Press</option>
                            <option value="aeropress">AeroPress</option>
                            <option value="moka">Moka</option>
                            <option value="cold_brew">Cold Brew</option>
                        </select>


                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
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

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={dict.recipeNamePlaceholder}
                                className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 outline-none"
                                value={recipeName}
                                onChange={(e) => setRecipeName(e.target.value)}
                            />

                            <button
                                type="button"
                                onClick={handleSaveRecipe}
                                className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                            >
                                {dict.save}
                            </button>
                        </div>

                        {saveMessage && (
                            <p className="text-[11px] text-neutral-400">{saveMessage}</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}