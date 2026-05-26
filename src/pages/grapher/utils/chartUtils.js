export const PALETTE = [
  "#7C1227",
  "#9d7e43",
  "#4b7c8a",
  "#b3885b",
  "#3d7a5c",
  "#6b5b2e",
  "#c45c6a",
  "#8b6914",
  "#2d6b8a",
  "#a05c3a",
];

/**
 * Convierte el array de módulos al formato que espera Recharts (PieChart).
 * @param {Array<{module_name: string, questions_count: number}>} modules
 * @returns {Array<{name: string, value: number, color: string}>}
 */
export function formatModulesForPie(modules) {
  return modules.map((m, i) => ({
    name: m.module_name,
    value: m.questions_count,
    color: PALETTE[i % PALETTE.length],
  }));
}

/**
 * Suma el total de preguntas de todos los módulos.
 * @param {Array<{questions_count: number}>} modules
 * @returns {number}
 */
export function calcTotal(modules) {
  return modules.reduce((sum, m) => sum + m.questions_count, 0);
}
