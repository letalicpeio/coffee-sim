import type { SavedRecipe } from "../components/types/recipe";

const STORAGE_KEY = "coffee_sim_recipes";

/**
 * Loads all saved recipes from localStorage.
 * Returns an empty array if nothing is stored or parsing fails.
 */
export function loadRecipes(): SavedRecipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SavedRecipe[]) : [];
  } catch {
    return [];
  }
}

function persist(recipes: SavedRecipe[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

/**
 * Prepends a new recipe to the list, persists, and returns the updated list.
 */
export function addRecipe(current: SavedRecipe[], recipe: SavedRecipe): SavedRecipe[] {
  const updated = [recipe, ...current];
  persist(updated);
  return updated;
}

/**
 * Removes a recipe by id, persists, and returns the updated list.
 */
export function removeRecipe(current: SavedRecipe[], id: string): SavedRecipe[] {
  const updated = current.filter((r) => r.id !== id);
  persist(updated);
  return updated;
}

/**
 * Removes the storage key entirely.
 */
export function clearRecipes(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
