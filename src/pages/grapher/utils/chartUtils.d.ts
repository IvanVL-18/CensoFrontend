import type { CensusModuleItem } from "../components/charts";

export declare const PALETTE: string[];

export declare function formatModulesForPie(
  modules: CensusModuleItem[]
): Array<{ name: string; value: number; color: string }>;

export declare function calcTotal(modules: CensusModuleItem[]): number;
