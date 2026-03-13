"use client";

import SimulatorHero from "./SimulatorHero";
import SimulatorResultPanel from "./SimulatorResultPanel";
import SimulatorControlsPanel from "./SimulatorControlsPanel";
import RecipeLibraryPanel from "./RecipeLibraryPanel";
import { useEffect, useMemo, useReducer, useState } from "react";
import { type Process, type Roast } from "../engine/espressoEngine";
import { simulateCoffee } from "../engine/simulationEngine";
import { useSearchParams } from "next/navigation";
import type { Dict } from "../lib/getDictionary";
import type { BrewMethod } from "./types/brew";
import type { SavedRecipe } from "./types/recipe";
import { loadRecipes, addRecipe, removeRecipe, clearRecipes } from "../lib/recipeStorage";
import type { MethodParams, EspressoParams, V60Params, FrenchPressParams, AeropressParams, MokaParams, ColdBrewParams } from "./types/engines";
import type { CoffeeInputs } from "../engine/simulationEngine";
import HybridRadarMap from "./HybridRadarMap";

type State = {
    method: BrewMethod;
    grind: number;
    ratio: number;
    roast: Roast;
    process: Process;
    v60TotalTimeS: number;
    fpTotalTimeS: number;
    aeroTotalTimeS: number;
    aeroPressureLevel: number;
    aeroInverted: boolean;
    mokaHeatLevel: number;
    mokaWaterTempC: number;
    coldBrewTotalTimeH: number;
    coldBrewFridgeTempC: number;
    advancedMode: boolean;
    useTemperature: boolean;
    usePressure: boolean;
    useWater: boolean;
    temperature: number;
    pressure: number;
    waterGH: number;
    waterKH: number;
    recipeName: string;
    copied: boolean;
    savedRecipes: SavedRecipe[];
    saveMessage: string;
    showMapHelp: boolean;
    showRadarHelp: boolean;
    showEngineInfo: boolean;
    showHybridHelp: boolean;
};

type Action =
    | { type: "SET_METHOD"; method: BrewMethod }
    | { type: "SET_GRIND"; value: number }
    | { type: "SET_RATIO"; value: number }
    | { type: "SET_ROAST"; value: Roast }
    | { type: "SET_PROCESS"; value: Process }
    | { type: "SET_V60_TOTAL_TIME"; value: number }
    | { type: "SET_FP_TOTAL_TIME"; value: number }
    | { type: "SET_AERO_TOTAL_TIME"; value: number }
    | { type: "SET_AERO_PRESSURE_LEVEL"; value: number }
    | { type: "SET_AERO_INVERTED"; value: boolean }
    | { type: "SET_MOKA_HEAT_LEVEL"; value: number }
    | { type: "SET_MOKA_WATER_TEMP"; value: number }
    | { type: "SET_COLD_BREW_TOTAL_TIME_H"; value: number }
    | { type: "SET_COLD_BREW_FRIDGE_TEMP"; value: number }
    | { type: "SET_ADVANCED_MODE"; value: boolean }
    | { type: "SET_USE_TEMPERATURE"; value: boolean }
    | { type: "SET_USE_PRESSURE"; value: boolean }
    | { type: "SET_USE_WATER"; value: boolean }
    | { type: "SET_TEMPERATURE"; value: number }
    | { type: "SET_PRESSURE"; value: number }
    | { type: "SET_WATER_GH"; value: number }
    | { type: "SET_WATER_KH"; value: number }
    | { type: "SET_RECIPE_NAME"; value: string }
    | { type: "SET_COPIED"; value: boolean }
    | { type: "SET_SAVED_RECIPES"; recipes: SavedRecipe[] }
    | { type: "SET_SAVE_MESSAGE"; value: string }
    | { type: "SET_SHOW_MAP_HELP"; value: boolean }
    | { type: "SET_SHOW_RADAR_HELP"; value: boolean }
    | { type: "SET_SHOW_ENGINE_INFO"; value: boolean }
    | { type: "SET_SHOW_HYBRID_HELP"; value: boolean }
    | { type: "LOAD_FROM_URL"; params: Partial<State> };

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: State = {
    method: "espresso",
    grind: 55,
    ratio: 2.0,
    roast: "claro",
    process: "lavado",
    v60TotalTimeS: 210,
    fpTotalTimeS: 240,
    aeroTotalTimeS: 90,
    aeroPressureLevel: 3,
    aeroInverted: false,
    mokaHeatLevel: 3,
    mokaWaterTempC: 20,
    coldBrewTotalTimeH: 16,
    coldBrewFridgeTempC: 4,
    advancedMode: false,
    useTemperature: false,
    usePressure: false,
    useWater: false,
    temperature: 93,
    pressure: 9,
    waterGH: 6,
    waterKH: 3,
    recipeName: "",
    copied: false,
    savedRecipes: [],
    saveMessage: "",
    showMapHelp: false,
    showRadarHelp: false,
    showEngineInfo: false,
    showHybridHelp: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_METHOD": {
            const { method } = action;
            const next: State = { ...state, method };
            const methodDefaults: Record<string, { grind: number; ratio: number }> = {
                espresso:     { grind: 55, ratio: 2.0  },
                v60:          { grind: 70, ratio: 15.0 },
                french_press: { grind: 40, ratio: 14.0 },
                aeropress:    { grind: 65, ratio: 8.0  },
                moka:         { grind: 80, ratio: 7.0  },
                cold_brew:    { grind: 45, ratio: 8.0  },
            };
            const def = methodDefaults[method];
            if (def) { next.grind = def.grind; next.ratio = def.ratio; }
            return next;
        }
        case "SET_GRIND":           return { ...state, grind: action.value };
        case "SET_RATIO":           return { ...state, ratio: action.value };
        case "SET_ROAST":           return { ...state, roast: action.value };
        case "SET_PROCESS":         return { ...state, process: action.value };
        case "SET_V60_TOTAL_TIME":          return { ...state, v60TotalTimeS: action.value };
        case "SET_FP_TOTAL_TIME":           return { ...state, fpTotalTimeS: action.value };
        case "SET_AERO_TOTAL_TIME":         return { ...state, aeroTotalTimeS: action.value };
        case "SET_AERO_PRESSURE_LEVEL":     return { ...state, aeroPressureLevel: action.value };
        case "SET_AERO_INVERTED":           return { ...state, aeroInverted: action.value };
        case "SET_MOKA_HEAT_LEVEL":         return { ...state, mokaHeatLevel: action.value };
        case "SET_MOKA_WATER_TEMP":         return { ...state, mokaWaterTempC: action.value };
        case "SET_COLD_BREW_TOTAL_TIME_H":  return { ...state, coldBrewTotalTimeH: action.value };
        case "SET_COLD_BREW_FRIDGE_TEMP":   return { ...state, coldBrewFridgeTempC: action.value };
        case "SET_ADVANCED_MODE": {
            const next = { ...state, advancedMode: action.value };
            if (action.value) {
                next.useTemperature = true;
                next.usePressure = true;
                next.useWater = true;
            }
            return next;
        }
        case "SET_USE_TEMPERATURE": return { ...state, useTemperature: action.value };
        case "SET_USE_PRESSURE":    return { ...state, usePressure: action.value };
        case "SET_USE_WATER":       return { ...state, useWater: action.value };
        case "SET_TEMPERATURE":     return { ...state, temperature: action.value };
        case "SET_PRESSURE":        return { ...state, pressure: action.value };
        case "SET_WATER_GH":        return { ...state, waterGH: action.value };
        case "SET_WATER_KH":        return { ...state, waterKH: action.value };
        case "SET_RECIPE_NAME":     return { ...state, recipeName: action.value };
        case "SET_COPIED":          return { ...state, copied: action.value };
        case "SET_SAVED_RECIPES":   return { ...state, savedRecipes: action.recipes };
        case "SET_SAVE_MESSAGE":    return { ...state, saveMessage: action.value };
        case "SET_SHOW_MAP_HELP":   return { ...state, showMapHelp: action.value };
        case "SET_SHOW_RADAR_HELP": return { ...state, showRadarHelp: action.value };
        case "SET_SHOW_ENGINE_INFO":return { ...state, showEngineInfo: action.value };
        case "SET_SHOW_HYBRID_HELP":return { ...state, showHybridHelp: action.value };
        case "LOAD_FROM_URL":       return { ...state, ...action.params };
        default:                    return state;
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

// TODO: doseG should eventually be stored as part of SavedRecipe
// so each saved recipe carries the dose it was brewed with.
const DEFAULT_DOSE = 18;
const doseG = DEFAULT_DOSE;

const METHOD_DISPLAY: Record<string, string> = {
    espresso: "Espresso", v60: "V60", french_press: "French Press",
    aeropress: "AeroPress", moka: "Moka", cold_brew: "Cold Brew",
};

/**
 * Converts a typed MethodParams (discriminated union) into the flat CoffeeInputs
 * shape expected by simulateCoffee.
 */
function paramsToInputs(p: MethodParams): CoffeeInputs {
    const base = { grind: p.grind, ratio: p.ratio, doseG: DEFAULT_DOSE, roast: p.roast, process: p.process };
    switch (p.method) {
        case "espresso": {
            const ep = p as EspressoParams;
            return { ...base, temperatureC: ep.temperatureC, pressureBar: ep.pressureBar, waterGH: ep.waterGH, waterKH: ep.waterKH };
        }
        case "v60": {
            const vp = p as V60Params;
            return { ...base, temperatureC: vp.temperatureC, totalTimeS: vp.totalTimeS, waterGH: vp.waterGH, waterKH: vp.waterKH };
        }
        case "french_press": {
            const fp = p as FrenchPressParams;
            return { ...base, temperatureC: fp.temperatureC, totalTimeS: fp.totalTimeS, waterGH: fp.waterGH, waterKH: fp.waterKH };
        }
        case "aeropress": {
            const ap = p as AeropressParams;
            return { ...base, temperatureC: ap.temperatureC, totalTimeS: ap.totalTimeS, pressureLevel: ap.pressureLevel, inverted: ap.inverted, waterGH: ap.waterGH, waterKH: ap.waterKH };
        }
        case "moka": {
            const mp = p as MokaParams;
            return { ...base, heatLevel: mp.heatLevel, waterTempC: mp.waterTempC, waterGH: mp.waterGH, waterKH: mp.waterKH };
        }
        case "cold_brew": {
            const cb = p as ColdBrewParams;
            return { ...base, totalTimeH: cb.totalTimeH, fridgeTempC: cb.fridgeTempC, waterGH: cb.waterGH, waterKH: cb.waterKH };
        }
    }
}

function getParamTemp(p: MethodParams): string {
    if ("temperatureC" in p && p.temperatureC !== undefined) return `${p.temperatureC}°C`;
    return "—";
}

function getParamTime(p: MethodParams): string {
    if ("totalTimeS" in p) {
        const s = (p as { totalTimeS: number }).totalTimeS;
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }
    if ("totalTimeH" in p) return `${(p as { totalTimeH: number }).totalTimeH}h`;
    return "—";
}

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
    const [state, dispatch] = useReducer(reducer, initialState);
    // compareRecipes is UI-only state: not persisted, not part of the brew params reducer.
    const [compareRecipes, setCompareRecipes] = useState<SavedRecipe[]>([]);

    const {
        method, grind, ratio, roast, process, v60TotalTimeS,
        fpTotalTimeS, aeroTotalTimeS, aeroPressureLevel, aeroInverted,
        mokaHeatLevel, mokaWaterTempC, coldBrewTotalTimeH, coldBrewFridgeTempC,
        advancedMode, useTemperature, usePressure, useWater,
        temperature, pressure, waterGH, waterKH,
        recipeName, copied, savedRecipes, saveMessage,
        showMapHelp, showRadarHelp, showEngineInfo, showHybridHelp,
    } = state;

    // ── Carga inicial de recetas ─────────────────────────────────────────────
    useEffect(() => {
        const recipes = loadRecipes();
        if (recipes.length > 0) dispatch({ type: "SET_SAVED_RECIPES", recipes });
    }, []);

    // ── Carga desde URL ──────────────────────────────────────────────────────
    useEffect(() => {
        const updates: Partial<State> = {};

        const m = searchParams.get("method");
        const loadedMethod: BrewMethod =
            m === "espresso" || m === "v60" || m === "french_press" ||
            m === "aeropress" || m === "moka" || m === "cold_brew"
                ? (m as BrewMethod)
                : "espresso";
        if (m) updates.method = loadedMethod;

        const g = searchParams.get("grind");
        if (g !== null) {
            const n = Number(g);
            if (!Number.isNaN(n)) updates.grind = Math.max(0, Math.min(100, Math.round(n)));
        }

        const r = searchParams.get("ratio");
        if (r !== null) {
            const n = Number(r);
            if (!Number.isNaN(n)) updates.ratio = Math.max(1.0, Math.min(20, Number(n.toFixed(1))));
        }

        const ro = searchParams.get("roast");
        if (ro === "claro" || ro === "medio" || ro === "oscuro") updates.roast = ro;

        const pr = searchParams.get("process");
        if (pr === "lavado" || pr === "natural" || pr === "honey") updates.process = pr;

        const nm = searchParams.get("name");
        if (nm !== null) updates.recipeName = nm;

        const t = searchParams.get("temperature");
        if (t !== null) {
            const n = Number(t);
            if (!Number.isNaN(n)) {
                updates.temperature = Math.max(80, Math.min(96, n));
                // Para espresso, temperatura en URL implica modo avanzado
                if (loadedMethod !== "v60" && loadedMethod !== "aeropress") {
                    updates.advancedMode = true;
                    updates.useTemperature = true;
                }
            }
        }

        const p = searchParams.get("pressure");
        if (p !== null) {
            const n = Number(p);
            if (!Number.isNaN(n)) {
                updates.pressure = Math.max(6, Math.min(10, n));
                updates.advancedMode = true;
                updates.usePressure = true;
            }
        }

        const gh = searchParams.get("waterGH");
        if (gh !== null) {
            const n = Number(gh);
            if (!Number.isNaN(n)) {
                updates.waterGH = Math.max(1, Math.min(12, n));
                updates.advancedMode = true;
                updates.useWater = true;
            }
        }

        const kh = searchParams.get("waterKH");
        if (kh !== null) {
            const n = Number(kh);
            if (!Number.isNaN(n)) {
                updates.waterKH = Math.max(0, Math.min(8, n));
                updates.advancedMode = true;
                updates.useWater = true;
            }
        }

        const totalTimeS = searchParams.get("totalTimeS");
        if (totalTimeS !== null) {
            const n = Number(totalTimeS);
            if (!Number.isNaN(n)) {
                if (loadedMethod === "v60")           updates.v60TotalTimeS  = Math.max(120, Math.min(360, n));
                else if (loadedMethod === "french_press") updates.fpTotalTimeS = Math.max(120, Math.min(360, n));
                else if (loadedMethod === "aeropress")    updates.aeroTotalTimeS = Math.max(30, Math.min(120, n));
            }
        }

        const totalTimeH = searchParams.get("totalTimeH");
        if (totalTimeH !== null) {
            const n = Number(totalTimeH);
            if (!Number.isNaN(n)) updates.coldBrewTotalTimeH = Math.max(8, Math.min(24, n));
        }

        const heatLevel = searchParams.get("heatLevel");
        if (heatLevel !== null) {
            const n = Number(heatLevel);
            if (!Number.isNaN(n)) updates.mokaHeatLevel = Math.max(1, Math.min(5, n));
        }

        const pressureLevel = searchParams.get("pressureLevel");
        if (pressureLevel !== null) {
            const n = Number(pressureLevel);
            if (!Number.isNaN(n)) updates.aeroPressureLevel = Math.max(1, Math.min(5, n));
        }

        const inverted = searchParams.get("inverted");
        if (inverted === "true") updates.aeroInverted = true;

        const fridgeTempC = searchParams.get("fridgeTempC");
        if (fridgeTempC !== null) {
            const n = Number(fridgeTempC);
            if (!Number.isNaN(n)) updates.coldBrewFridgeTempC = Math.max(2, Math.min(8, n));
        }

        const waterTempC = searchParams.get("waterTempC");
        if (waterTempC !== null) {
            const n = Number(waterTempC);
            if (!Number.isNaN(n)) updates.mokaWaterTempC = Math.max(20, Math.min(95, n));
        }

        if (Object.keys(updates).length > 0) {
            dispatch({ type: "LOAD_FROM_URL", params: updates });
        }
    }, [searchParams]);

    // ── Sincronización a URL ─────────────────────────────────────────────────
    useEffect(() => {
        const qs = new URLSearchParams();
        qs.set("method", method);
        qs.set("grind", String(grind));
        qs.set("ratio", ratio.toFixed(1));
        qs.set("roast", roast);
        qs.set("process", process);

        if (recipeName.trim()) qs.set("name", recipeName.trim());

        if (method === "v60") {
            qs.set("temperature", String(temperature));
            qs.set("totalTimeS", String(v60TotalTimeS));
        } else if (method === "aeropress") {
            qs.set("temperature", String(temperature));
            qs.set("totalTimeS", String(aeroTotalTimeS));
            if (advancedMode) { qs.set("pressureLevel", String(aeroPressureLevel)); if (aeroInverted) qs.set("inverted", "true"); }
        } else if (method === "french_press") {
            qs.set("totalTimeS", String(fpTotalTimeS));
            if (advancedMode && useTemperature) qs.set("temperature", String(temperature));
        } else if (method === "moka") {
            qs.set("heatLevel", String(mokaHeatLevel));
            if (advancedMode) qs.set("waterTempC", String(mokaWaterTempC));
        } else if (method === "cold_brew") {
            qs.set("totalTimeH", String(coldBrewTotalTimeH));
            qs.set("fridgeTempC", String(coldBrewFridgeTempC));
        } else {
            if (advancedMode && useTemperature) qs.set("temperature", String(temperature));
            if (advancedMode && usePressure) qs.set("pressure", String(pressure));
        }

        if (advancedMode && useWater) {
            qs.set("waterGH", String(waterGH));
            qs.set("waterKH", String(waterKH));
        }

        window.history.replaceState(null, "", `${window.location.pathname}?${qs.toString()}`);
    }, [
        method, grind, ratio, roast, process, recipeName,
        advancedMode, useTemperature, temperature, usePressure, pressure,
        useWater, waterGH, waterKH, v60TotalTimeS,
        fpTotalTimeS, aeroTotalTimeS, aeroPressureLevel, aeroInverted,
        mokaHeatLevel, mokaWaterTempC, coldBrewTotalTimeH, coldBrewFridgeTempC,
    ]);

    // ── Resultado del motor ──────────────────────────────────────────────────
    const result = useMemo(
        () => simulateCoffee(method, {
            grind,
            ratio,
            doseG,
            roast,
            process,
            temperatureC:
                method === "v60" || method === "aeropress" ? temperature
                : method === "french_press" ? (advancedMode && useTemperature ? temperature : 93)
                : method === "espresso" && advancedMode && useTemperature ? temperature
                : undefined,
            pressureBar:    method === "espresso" && advancedMode && usePressure ? pressure : undefined,
            waterGH:        advancedMode && useWater ? waterGH : undefined,
            waterKH:        advancedMode && useWater ? waterKH : undefined,
            totalTimeS:     method === "v60" ? v60TotalTimeS
                          : method === "french_press" ? fpTotalTimeS
                          : method === "aeropress" ? aeroTotalTimeS
                          : undefined,
            totalTimeH:     method === "cold_brew" ? coldBrewTotalTimeH : undefined,
            heatLevel:      method === "moka" ? mokaHeatLevel : undefined,
            pressureLevel:  method === "aeropress" && advancedMode ? aeroPressureLevel : undefined,
            inverted:       method === "aeropress" && advancedMode ? aeroInverted : undefined,
            fridgeTempC:    method === "cold_brew" ? coldBrewFridgeTempC : undefined,
            waterTempC:     method === "moka" && advancedMode ? mokaWaterTempC : undefined,
        }),
        [method, grind, ratio, roast, process, advancedMode, useTemperature, temperature,
         usePressure, pressure, useWater, waterGH, waterKH, v60TotalTimeS,
         fpTotalTimeS, aeroTotalTimeS, aeroPressureLevel, aeroInverted,
         mokaHeatLevel, mokaWaterTempC, coldBrewTotalTimeH, coldBrewFridgeTempC]
    );

    // ── Etiquetas derivadas ──────────────────────────────────────────────────
    const stateLabel =
        result.state === "Subextraído" ? dict.state_under :
        result.state === "Balanceado"  ? dict.state_balanced :
                                         dict.state_over;

    const styleLabels: Record<string, string> = {
        Ristretto: dict.style_ristretto,
        Espresso:  dict.style_espresso,
        Lungo:     dict.style_lungo,
    };

    const roastLabels: Record<string, string> = {
        claro:  dict.roast_light,
        medio:  dict.roast_medium,
        oscuro: dict.roast_dark,
    };

    const processLabels: Record<string, string> = {
        lavado:  dict.process_washed,
        natural: dict.process_natural,
        honey:   dict.process_honey,
    };

    const roastLabel   = roastLabels[roast] ?? roast;
    const processLabel = processLabels[process] ?? process;
    const stateKey     = result.state === "Subextraído" ? "sub" : result.state === "Balanceado" ? "bal" : "over";
    const stateDescription = (dict[`state_desc_${stateKey}_${method}`] ?? dict[`state_desc_${stateKey}`] ?? "") as string;
    const styleLabel =
        method === "espresso"     ? (styleLabels[result.styleHint ?? ""] ?? result.styleHint ?? "") :
        method === "v60"          ? "V60" :
        method === "french_press" ? "French Press" :
        method === "aeropress"    ? "Aeropress" :
        method === "moka"         ? "Moka" :
                                    "Cold Brew";

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSaveRecipe = () => {
        const trimmedName = recipeName.trim();
        if (!trimmedName) {
            dispatch({ type: "SET_SAVE_MESSAGE", value: dict.saveRecipeNeedName });
            window.setTimeout(() => dispatch({ type: "SET_SAVE_MESSAGE", value: "" }), 2000);
            return;
        }

        const commonWater = {
            waterGH: advancedMode && useWater ? waterGH : undefined,
            waterKH: advancedMode && useWater ? waterKH : undefined,
        };

        const params: MethodParams = (() => {
            switch (method) {
                case "v60":
                    return { method: "v60" as const, grind, ratio, roast, process, temperatureC: temperature, totalTimeS: v60TotalTimeS, ...commonWater };
                case "french_press":
                    return { method: "french_press" as const, grind, ratio, roast, process, totalTimeS: fpTotalTimeS, temperatureC: advancedMode && useTemperature ? temperature : undefined, ...commonWater };
                case "aeropress":
                    return { method: "aeropress" as const, grind, ratio, roast, process, temperatureC: temperature, totalTimeS: aeroTotalTimeS, pressureLevel: advancedMode ? aeroPressureLevel : undefined, inverted: advancedMode ? aeroInverted : undefined, ...commonWater };
                case "moka":
                    return { method: "moka" as const, grind, ratio, roast, process, heatLevel: mokaHeatLevel, waterTempC: advancedMode ? mokaWaterTempC : undefined, ...commonWater };
                case "cold_brew":
                    return { method: "cold_brew" as const, grind, ratio, roast, process, totalTimeH: coldBrewTotalTimeH, fridgeTempC: coldBrewFridgeTempC, ...commonWater };
                default:
                    return { method: "espresso" as const, grind, ratio, roast, process, temperatureC: advancedMode && useTemperature ? temperature : undefined, pressureBar: advancedMode && usePressure ? pressure : undefined, ...commonWater };
            }
        })();

        const newRecipe: SavedRecipe = {
            id: crypto.randomUUID(),
            name: trimmedName,
            locale,
            method,
            params,
            createdAt: new Date().toISOString(),
        };

        const updated = addRecipe(savedRecipes, newRecipe);
        dispatch({ type: "SET_SAVED_RECIPES", recipes: updated });
        dispatch({ type: "SET_SAVE_MESSAGE", value: dict.recipeSaved });
        window.setTimeout(() => dispatch({ type: "SET_SAVE_MESSAGE", value: "" }), 2000);
    };

    const handleLoadRecipe = (recipe: SavedRecipe) => {
        const p = recipe.params;
        // Start clean: reset advanced toggles; re-enable below if recipe has advanced params
        const updates: Partial<State> = {
            method: recipe.method,
            grind: p.grind,
            ratio: p.ratio,
            roast: p.roast,
            process: p.process,
            recipeName: recipe.name,
            advancedMode: false,
            useTemperature: false,
            usePressure: false,
            useWater: false,
        };

        // Water (shared advanced param)
        if (p.waterGH !== undefined) { updates.waterGH = p.waterGH; updates.advancedMode = true; updates.useWater = true; }
        if (p.waterKH !== undefined) { updates.waterKH = p.waterKH; updates.advancedMode = true; updates.useWater = true; }

        // Method-specific params
        switch (p.method) {
            case "espresso":
                if (p.temperatureC !== undefined) { updates.temperature = p.temperatureC; updates.advancedMode = true; updates.useTemperature = true; }
                if (p.pressureBar  !== undefined) { updates.pressure = p.pressureBar;     updates.advancedMode = true; updates.usePressure = true; }
                break;
            case "v60":
                updates.temperature   = p.temperatureC;
                updates.v60TotalTimeS = p.totalTimeS;
                break;
            case "french_press":
                updates.fpTotalTimeS = p.totalTimeS;
                if (p.temperatureC !== undefined) { updates.temperature = p.temperatureC; updates.advancedMode = true; updates.useTemperature = true; }
                break;
            case "aeropress":
                updates.temperature    = p.temperatureC;
                updates.aeroTotalTimeS = p.totalTimeS;
                if (p.pressureLevel !== undefined) { updates.aeroPressureLevel = p.pressureLevel; updates.advancedMode = true; }
                if (p.inverted      !== undefined) { updates.aeroInverted = p.inverted;            updates.advancedMode = true; }
                break;
            case "moka":
                updates.mokaHeatLevel = p.heatLevel;
                if (p.waterTempC !== undefined) { updates.mokaWaterTempC = p.waterTempC; updates.advancedMode = true; }
                break;
            case "cold_brew":
                updates.coldBrewTotalTimeH = p.totalTimeH;
                if (p.fridgeTempC !== undefined) { updates.coldBrewFridgeTempC = p.fridgeTempC; }
                break;
        }

        dispatch({ type: "LOAD_FROM_URL", params: updates });
    };

    const handleDeleteRecipe = (id: string) => {
        const updated = removeRecipe(savedRecipes, id);
        dispatch({ type: "SET_SAVED_RECIPES", recipes: updated });
    };

    const handleClearAll = () => {
        clearRecipes();
        dispatch({ type: "SET_SAVED_RECIPES", recipes: [] });
        setCompareRecipes([]);
    };

    /**
     * Toggles a recipe in/out of the comparison selection.
     * - If already selected: removes it.
     * - If fewer than 2 selected: adds it.
     * - If 2 already selected: replaces the oldest (index 0, added first).
     */
    const handleToggleCompare = (id: string) => {
        setCompareRecipes((prev) => {
            if (prev.some((r) => r.id === id)) {
                return prev.filter((r) => r.id !== id);
            }
            const recipe = savedRecipes.find((r) => r.id === id);
            if (!recipe) return prev;
            if (prev.length < 2) return [...prev, recipe];
            // Replace oldest (index 0)
            return [prev[1], recipe];
        });
    };

    /** Runs the simulation for both comparison recipes when two are selected. */
    const compareResults = useMemo(() => {
        if (compareRecipes.length < 2) return null;
        const [a, b] = compareRecipes;
        return [
            simulateCoffee(a.method, paramsToInputs(a.params)),
            simulateCoffee(b.method, paramsToInputs(b.params)),
        ] as const;
    }, [compareRecipes]);

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-50">
            <SimulatorHero
                dict={dict}
                locale={locale}
                method={method}
                setMethod={(m) => dispatch({ type: "SET_METHOD", method: m })}
                searchParams={searchParams}
                copied={copied}
                setCopied={(v) => dispatch({ type: "SET_COPIED", value: v })}
                recipeName={recipeName}
                setRecipeName={(v) => dispatch({ type: "SET_RECIPE_NAME", value: v })}
                handleSaveRecipe={handleSaveRecipe}
                saveMessage={saveMessage}
            />

            <section id="simulador" className="mx-auto w-full max-w-screen-2xl px-4 pb-20 lg:px-6">
                {/* ── Mobile layout: single merged card (hidden at md+) ─────────── */}
                <div className="md:hidden flex flex-col gap-6">
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
                        <SimulatorResultPanel
                            slim
                            dict={dict}
                            recipeName={recipeName}
                            stateLabel={stateLabel}
                            styleLabel={styleLabel}
                            roastLabel={roastLabel}
                            processLabel={processLabel}
                            stateDescription={stateDescription}
                            result={result}
                            ratio={ratio}
                            grind={grind}
                            doseG={doseG}
                            advancedMode={advancedMode}
                            useTemperature={useTemperature}
                            usePressure={usePressure}
                            temperature={temperature}
                            pressure={pressure}
                            showMapHelp={showMapHelp}
                            setShowMapHelp={(v) => dispatch({ type: "SET_SHOW_MAP_HELP", value: v })}
                            showRadarHelp={showRadarHelp}
                            setShowRadarHelp={(v) => dispatch({ type: "SET_SHOW_RADAR_HELP", value: v })}
                            showHybridHelp={showHybridHelp}
                            setShowHybridHelp={(v) => dispatch({ type: "SET_SHOW_HYBRID_HELP", value: v })}
                            showEngineInfo={showEngineInfo}
                            setShowEngineInfo={(v) => dispatch({ type: "SET_SHOW_ENGINE_INFO", value: v })}
                            method={method}
                        />
                        <SimulatorControlsPanel
                            slim
                            dict={dict}
                            locale={locale}
                            method={method}
                            advancedMode={advancedMode}
                            setAdvancedMode={(v) => dispatch({ type: "SET_ADVANCED_MODE", value: v })}
                            useTemperature={useTemperature}
                            setUseTemperature={(v) => dispatch({ type: "SET_USE_TEMPERATURE", value: v })}
                            usePressure={usePressure}
                            setUsePressure={(v) => dispatch({ type: "SET_USE_PRESSURE", value: v })}
                            useWater={useWater}
                            setUseWater={(v) => dispatch({ type: "SET_USE_WATER", value: v })}
                            grind={grind}
                            setGrind={(v) => dispatch({ type: "SET_GRIND", value: v })}
                            ratio={ratio}
                            setRatio={(v) => dispatch({ type: "SET_RATIO", value: v })}
                            temperature={temperature}
                            setTemperature={(v) => dispatch({ type: "SET_TEMPERATURE", value: v })}
                            pressure={pressure}
                            setPressure={(v) => dispatch({ type: "SET_PRESSURE", value: v })}
                            waterGH={waterGH}
                            setWaterGH={(v) => dispatch({ type: "SET_WATER_GH", value: v })}
                            waterKH={waterKH}
                            setWaterKH={(v) => dispatch({ type: "SET_WATER_KH", value: v })}
                            roast={roast}
                            setRoast={(v) => dispatch({ type: "SET_ROAST", value: v })}
                            process={process}
                            setProcess={(v) => dispatch({ type: "SET_PROCESS", value: v })}
                            roastLabel={roastLabel}
                            processLabel={processLabel}
                            v60TotalTimeS={v60TotalTimeS}
                            setV60TotalTimeS={(v) => dispatch({ type: "SET_V60_TOTAL_TIME", value: v })}
                            fpTotalTimeS={fpTotalTimeS}
                            setFpTotalTimeS={(v) => dispatch({ type: "SET_FP_TOTAL_TIME", value: v })}
                            aeroTotalTimeS={aeroTotalTimeS}
                            setAeroTotalTimeS={(v) => dispatch({ type: "SET_AERO_TOTAL_TIME", value: v })}
                            aeroPressureLevel={aeroPressureLevel}
                            setAeroPressureLevel={(v) => dispatch({ type: "SET_AERO_PRESSURE_LEVEL", value: v })}
                            aeroInverted={aeroInverted}
                            setAeroInverted={(v) => dispatch({ type: "SET_AERO_INVERTED", value: v })}
                            mokaHeatLevel={mokaHeatLevel}
                            setMokaHeatLevel={(v) => dispatch({ type: "SET_MOKA_HEAT_LEVEL", value: v })}
                            mokaWaterTempC={mokaWaterTempC}
                            setMokaWaterTempC={(v) => dispatch({ type: "SET_MOKA_WATER_TEMP", value: v })}
                            coldBrewTotalTimeH={coldBrewTotalTimeH}
                            setColdBrewTotalTimeH={(v) => dispatch({ type: "SET_COLD_BREW_TOTAL_TIME_H", value: v })}
                            coldBrewFridgeTempC={coldBrewFridgeTempC}
                            setColdBrewFridgeTempC={(v) => dispatch({ type: "SET_COLD_BREW_FRIDGE_TEMP", value: v })}
                        />
                    </div>

                    <RecipeLibraryPanel
                        dict={dict}
                        recipes={savedRecipes}
                        locale={locale}
                        onLoadRecipe={handleLoadRecipe}
                        onDeleteRecipe={handleDeleteRecipe}
                        onClearAll={handleClearAll}
                        selectedIds={compareRecipes.map((r) => r.id)}
                        onToggleSelect={handleToggleCompare}
                    />
                </div>

                {/* ── Desktop layout: separate cards in 2-col grid (hidden below md) ── */}
                <div className="hidden md:grid w-full gap-6 md:grid-cols-2">
                    <SimulatorResultPanel
                        dict={dict}
                        recipeName={recipeName}
                        stateLabel={stateLabel}
                        styleLabel={styleLabel}
                        roastLabel={roastLabel}
                        processLabel={processLabel}
                        stateDescription={stateDescription}
                        result={result}
                        ratio={ratio}
                        grind={grind}
                        doseG={doseG}
                        advancedMode={advancedMode}
                        useTemperature={useTemperature}
                        usePressure={usePressure}
                        temperature={temperature}
                        pressure={pressure}
                        showMapHelp={showMapHelp}
                        setShowMapHelp={(v) => dispatch({ type: "SET_SHOW_MAP_HELP", value: v })}
                        showRadarHelp={showRadarHelp}
                        setShowRadarHelp={(v) => dispatch({ type: "SET_SHOW_RADAR_HELP", value: v })}
                        showHybridHelp={showHybridHelp}
                        setShowHybridHelp={(v) => dispatch({ type: "SET_SHOW_HYBRID_HELP", value: v })}
                        showEngineInfo={showEngineInfo}
                        setShowEngineInfo={(v) => dispatch({ type: "SET_SHOW_ENGINE_INFO", value: v })}
                        method={method}
                    />

                    <div className="flex flex-col gap-6">
                        <SimulatorControlsPanel
                            dict={dict}
                            locale={locale}
                            method={method}
                            advancedMode={advancedMode}
                            setAdvancedMode={(v) => dispatch({ type: "SET_ADVANCED_MODE", value: v })}
                            useTemperature={useTemperature}
                            setUseTemperature={(v) => dispatch({ type: "SET_USE_TEMPERATURE", value: v })}
                            usePressure={usePressure}
                            setUsePressure={(v) => dispatch({ type: "SET_USE_PRESSURE", value: v })}
                            useWater={useWater}
                            setUseWater={(v) => dispatch({ type: "SET_USE_WATER", value: v })}
                            grind={grind}
                            setGrind={(v) => dispatch({ type: "SET_GRIND", value: v })}
                            ratio={ratio}
                            setRatio={(v) => dispatch({ type: "SET_RATIO", value: v })}
                            temperature={temperature}
                            setTemperature={(v) => dispatch({ type: "SET_TEMPERATURE", value: v })}
                            pressure={pressure}
                            setPressure={(v) => dispatch({ type: "SET_PRESSURE", value: v })}
                            waterGH={waterGH}
                            setWaterGH={(v) => dispatch({ type: "SET_WATER_GH", value: v })}
                            waterKH={waterKH}
                            setWaterKH={(v) => dispatch({ type: "SET_WATER_KH", value: v })}
                            roast={roast}
                            setRoast={(v) => dispatch({ type: "SET_ROAST", value: v })}
                            process={process}
                            setProcess={(v) => dispatch({ type: "SET_PROCESS", value: v })}
                            roastLabel={roastLabel}
                            processLabel={processLabel}
                            v60TotalTimeS={v60TotalTimeS}
                            setV60TotalTimeS={(v) => dispatch({ type: "SET_V60_TOTAL_TIME", value: v })}
                            fpTotalTimeS={fpTotalTimeS}
                            setFpTotalTimeS={(v) => dispatch({ type: "SET_FP_TOTAL_TIME", value: v })}
                            aeroTotalTimeS={aeroTotalTimeS}
                            setAeroTotalTimeS={(v) => dispatch({ type: "SET_AERO_TOTAL_TIME", value: v })}
                            aeroPressureLevel={aeroPressureLevel}
                            setAeroPressureLevel={(v) => dispatch({ type: "SET_AERO_PRESSURE_LEVEL", value: v })}
                            aeroInverted={aeroInverted}
                            setAeroInverted={(v) => dispatch({ type: "SET_AERO_INVERTED", value: v })}
                            mokaHeatLevel={mokaHeatLevel}
                            setMokaHeatLevel={(v) => dispatch({ type: "SET_MOKA_HEAT_LEVEL", value: v })}
                            mokaWaterTempC={mokaWaterTempC}
                            setMokaWaterTempC={(v) => dispatch({ type: "SET_MOKA_WATER_TEMP", value: v })}
                            coldBrewTotalTimeH={coldBrewTotalTimeH}
                            setColdBrewTotalTimeH={(v) => dispatch({ type: "SET_COLD_BREW_TOTAL_TIME_H", value: v })}
                            coldBrewFridgeTempC={coldBrewFridgeTempC}
                            setColdBrewFridgeTempC={(v) => dispatch({ type: "SET_COLD_BREW_FRIDGE_TEMP", value: v })}
                        />

                        <RecipeLibraryPanel
                            dict={dict}
                            recipes={savedRecipes}
                            locale={locale}
                            onLoadRecipe={handleLoadRecipe}
                            onDeleteRecipe={handleDeleteRecipe}
                            onClearAll={handleClearAll}
                            selectedIds={compareRecipes.map((r) => r.id)}
                            onToggleSelect={handleToggleCompare}
                        />
                    </div>
                </div>

                {/* ── Comparison section ──────────────────────────────────── */}
                {compareResults && (
                    <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
                        <h2 className="text-lg font-semibold">{dict.comparison}</h2>

                        {/* legend */}
                        <div className="mt-2 flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-neutral-300" />
                                <span className="font-medium text-neutral-200">A</span>
                                <span className="text-neutral-400">{compareRecipes[0].name}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="font-medium text-amber-400">B</span>
                                <span className="text-neutral-400">{compareRecipes[1].name}</span>
                            </span>
                        </div>

                        <div className="mt-4 grid gap-6 lg:grid-cols-2">
                            {/* radar overlay */}
                            <HybridRadarMap
                                profiles={[
                                    {
                                        axes: compareResults[0].axes,
                                        grind: compareRecipes[0].params.grind,
                                        ratio: compareRecipes[0].params.ratio,
                                        color: "rgba(255,255,255,0.9)",
                                    },
                                    {
                                        axes: compareResults[1].axes,
                                        grind: compareRecipes[1].params.grind,
                                        ratio: compareRecipes[1].params.ratio,
                                        color: "rgba(251,191,36,0.9)",
                                    },
                                ]}
                                dict={dict}
                            />

                            {/* comparison table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-[11px] text-neutral-500">
                                            <th className="pb-2 pr-4 text-left font-normal"></th>
                                            <th className="pb-2 pr-4 text-left font-medium text-neutral-200">
                                                <span className="mr-1.5 inline-block rounded bg-neutral-600 px-1 py-0.5 text-[10px] font-bold text-white">A</span>
                                                {compareRecipes[0].name}
                                            </th>
                                            <th className="pb-2 text-left font-medium text-amber-400">
                                                <span className="mr-1.5 inline-block rounded bg-amber-500/80 px-1 py-0.5 text-[10px] font-bold text-neutral-950">B</span>
                                                {compareRecipes[1].name}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/60">
                                        {[
                                            {
                                                label: dict.methodLabel,
                                                a: METHOD_DISPLAY[compareRecipes[0].method] ?? compareRecipes[0].method,
                                                b: METHOD_DISPLAY[compareRecipes[1].method] ?? compareRecipes[1].method,
                                            },
                                            {
                                                label: dict.grindLabel,
                                                a: `${compareRecipes[0].params.grind}/100`,
                                                b: `${compareRecipes[1].params.grind}/100`,
                                            },
                                            {
                                                label: dict.ratioLabel,
                                                a: `1:${compareRecipes[0].params.ratio.toFixed(1)}`,
                                                b: `1:${compareRecipes[1].params.ratio.toFixed(1)}`,
                                            },
                                            {
                                                label: dict.temperatureLabel,
                                                a: getParamTemp(compareRecipes[0].params),
                                                b: getParamTemp(compareRecipes[1].params),
                                            },
                                            {
                                                label: dict.brewTimeLabel,
                                                a: getParamTime(compareRecipes[0].params),
                                                b: getParamTime(compareRecipes[1].params),
                                            },
                                            {
                                                label: dict.estimatedExtraction,
                                                a: `${Math.round(compareResults[0].extraction)}/100`,
                                                b: `${Math.round(compareResults[1].extraction)}/100`,
                                            },
                                            {
                                                label: dict.statusLabel,
                                                a: compareResults[0].state === "Subextraído" ? dict.state_under : compareResults[0].state === "Balanceado" ? dict.state_balanced : dict.state_over,
                                                b: compareResults[1].state === "Subextraído" ? dict.state_under : compareResults[1].state === "Balanceado" ? dict.state_balanced : dict.state_over,
                                            },
                                        ].map(({ label, a, b }) => (
                                            <tr key={label}>
                                                <td className="py-2 pr-4 text-neutral-500">{label}</td>
                                                <td className="py-2 pr-4 text-neutral-200">{a}</td>
                                                <td className="py-2 text-amber-300">{b}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
