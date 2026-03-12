import { simulateEspresso, type EspressoInputs, type FlavorAxes } from "./espressoEngine";
import { simulateV60, type V60Inputs } from "./V60Engine";
import { simulateFrenchPress, type FrenchPressInputs } from "./FrenchPressEngine";
import { simulateAeropress, type AeropressInputs } from "./AeropressEngine";
import { simulateMoka, type MokaInputs } from "./MokaEngine";
import { simulateColdBrew, type ColdBrewInputs } from "./ColdBrewEngine";
import type { BrewMethod } from "../components/types/brew";

export type SimulationResult = {
  extraction: number;
  estimatedTimeS: number;
  state: "Subextraído" | "Balanceado" | "Sobreextraído";
  styleHint?: "Ristretto" | "Espresso" | "Lungo";
  beverageG: number;
  axes: FlavorAxes;
};

export type CoffeeInputs = EspressoInputs & {
  totalTimeS?: number;       // v60, french_press, aeropress (segundos)
  totalTimeH?: number;       // cold_brew (horas)
  heatLevel?: number;        // moka (1–5)
  pressureLevel?: number;    // aeropress (1–5)
  inverted?: boolean;        // aeropress
  fridgeTempC?: number;      // cold_brew
  waterTempC?: number;       // moka
};

export function simulateCoffee(
  method: BrewMethod,
  input: CoffeeInputs
): SimulationResult {
  switch (method) {
    case "espresso":
      return simulateEspresso(input);

    case "v60": {
      const v60Input: V60Inputs = {
        grind: input.grind,
        ratio: input.ratio,
        doseG: input.doseG,
        temperatureC: input.temperatureC ?? 93,
        totalTimeS: input.totalTimeS ?? 210,
        roast: input.roast,
        process: input.process,
        waterGH: input.waterGH,
        waterKH: input.waterKH,
      };
      return simulateV60(v60Input);
    }

    case "french_press": {
      const fpInput: FrenchPressInputs = {
        grind: input.grind,
        ratio: input.ratio,
        doseG: input.doseG,
        temperatureC: input.temperatureC ?? 93,
        totalTimeS: input.totalTimeS ?? 240,
        roast: input.roast,
        process: input.process,
        waterGH: input.waterGH,
        waterKH: input.waterKH,
      };
      return simulateFrenchPress(fpInput);
    }

    case "aeropress": {
      const aeroInput: AeropressInputs = {
        grind: input.grind,
        ratio: input.ratio,
        doseG: input.doseG,
        temperatureC: input.temperatureC ?? 88,
        totalTimeS: input.totalTimeS ?? 90,
        roast: input.roast,
        process: input.process,
        waterGH: input.waterGH,
        waterKH: input.waterKH,
        pressureLevel: input.pressureLevel ?? 3,
        inverted: input.inverted ?? false,
      };
      return simulateAeropress(aeroInput);
    }

    case "moka": {
      const mokaInput: MokaInputs = {
        grind: input.grind,
        ratio: input.ratio,
        doseG: input.doseG,
        heatLevel: input.heatLevel ?? 3,
        roast: input.roast,
        process: input.process,
        waterGH: input.waterGH,
        waterKH: input.waterKH,
        waterTempC: input.waterTempC,
      };
      return simulateMoka(mokaInput);
    }

    case "cold_brew": {
      const cbInput: ColdBrewInputs = {
        grind: input.grind,
        ratio: input.ratio,
        totalTimeH: input.totalTimeH ?? 16,
        roast: input.roast,
        process: input.process,
        waterGH: input.waterGH,
        waterKH: input.waterKH,
        fridgeTempC: input.fridgeTempC ?? 4,
      };
      return simulateColdBrew(cbInput);
    }

    default:
      return simulateEspresso(input);
  }
}
