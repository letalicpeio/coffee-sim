"use client";

import type { SavedRecipe } from "./types/recipe";
import type { Dict } from "../lib/getDictionary";

/** Maps internal method keys to display labels (same in all locales). */
const METHOD_LABELS: Record<string, string> = {
  espresso:     "Espresso",
  v60:          "V60",
  french_press: "French Press",
  aeropress:    "AeroPress",
  moka:         "Moka",
  cold_brew:    "Cold Brew",
};

type Props = {
  dict: Dict;
  recipes: SavedRecipe[];
  locale: "es" | "en";
  onLoadRecipe: (recipe: SavedRecipe) => void;
  onDeleteRecipe: (id: string) => void;
  onClearAll: () => void;
  /** IDs of the (up to 2) recipes currently selected for comparison. */
  selectedIds: string[];
  /** Toggle a recipe in/out of the comparison selection. */
  onToggleSelect: (id: string) => void;
};

/**
 * Presentational component for the personal recipe library.
 * Contains no state and no storage logic — all actions are delegated via callbacks.
 */
export default function RecipeLibraryPanel({
  dict,
  recipes,
  onLoadRecipe,
  onDeleteRecipe,
  onClearAll,
  selectedIds,
  onToggleSelect,
}: Props) {
  const maxSelected = selectedIds.length >= 2;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{dict.savedRecipes}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">{recipes.length}</span>
          {recipes.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-1 text-[11px] text-neutral-200 hover:bg-neutral-900"
            >
              {dict.clearAllRecipes}
            </button>
          )}
        </div>
      </div>

      {recipes.length === 0 ? (
        <p className="mt-3 text-xs text-neutral-500">{dict.noSavedRecipes}</p>
      ) : (
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
          {recipes.map((recipe) => {
            const selectionIndex = selectedIds.indexOf(recipe.id);
            const isSelected = selectionIndex !== -1;
            // A = index 0, B = index 1
            const slot = isSelected ? (selectionIndex === 0 ? "A" : "B") : null;

            return (
              <div
                key={recipe.id}
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  isSelected
                    ? slot === "A"
                      ? "border-neutral-400 bg-neutral-800/60"
                      : "border-amber-500/60 bg-amber-950/30"
                    : "border-neutral-800 bg-neutral-900/50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {slot && (
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            slot === "A"
                              ? "bg-neutral-600 text-white"
                              : "bg-amber-500/80 text-neutral-950"
                          }`}
                        >
                          {slot}
                        </span>
                      )}
                      <p className="truncate text-xs font-medium text-neutral-200">
                        {recipe.name}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {METHOD_LABELS[recipe.method]} · {recipe.params.grind}/100 · 1:{recipe.params.ratio.toFixed(1)} · {recipe.params.roast} · {recipe.params.process}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {/* Compare toggle */}
                    <button
                      type="button"
                      onClick={() => onToggleSelect(recipe.id)}
                      disabled={maxSelected && !isSelected}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] transition ${
                        isSelected
                          ? slot === "A"
                            ? "border-neutral-500 bg-neutral-700 text-white hover:bg-neutral-600"
                            : "border-amber-500/60 bg-amber-900/40 text-amber-300 hover:bg-amber-900/60"
                          : maxSelected
                          ? "cursor-not-allowed border-neutral-800 bg-neutral-950/40 text-neutral-600"
                          : "border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                      }`}
                    >
                      {isSelected ? dict.removeFromCompare : dict.compare}
                    </button>

                    <button
                      type="button"
                      onClick={() => onLoadRecipe(recipe)}
                      className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-1 text-[11px] text-neutral-200 hover:bg-neutral-900"
                    >
                      {dict.loadRecipe}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecipe(recipe.id)}
                      className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-1 text-[11px] text-neutral-200 hover:bg-neutral-900"
                    >
                      {dict.deleteRecipe}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {recipes.length >= 2 && selectedIds.length < 2 && (
        <p className="mt-3 text-[11px] text-neutral-500">{dict.selectToCompare}</p>
      )}
    </div>
  );
}
