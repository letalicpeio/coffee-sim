import type { BrewMethod } from "./brew";
import type { MethodParams } from "./engines";

export type SavedRecipe = {
  id: string;
  name: string;
  locale: "es" | "en";
  method: BrewMethod;
  params: MethodParams;
  createdAt: string;
};
