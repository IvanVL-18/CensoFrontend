/**
 * Motor de operaciones matemáticas sobre las respuestas (submissions)
 * de los formularios Form.io.
 *
 * Única fuente de verdad — antes existían 5 copias de este motor
 * (AnswerModal, AdminAnswerModal, 2× PreviewQuestionModal, generateAnswersPdf).
 *
 * Soporta expresiones completas, no solo una función aislada:
 *
 *   SUMAR(monto)
 *   SUMAR(monto) + 20
 *   SUMAR(ingresos) - SUMAR(egresos)
 *   CONTARSI(tipo, tipo == "1") * 100 / CONTAR(tipo)
 *
 * Funciones básicas:       SUMAR, CONTAR, PROMEDIAR, MAX, MIN
 * Funciones condicionales: SUMARSI, CONTARSI, PROMEDIARSI, MAXSI, MINSI
 *   → FUNCIONSI(variable, condicion) — la condición se evalúa por registro
 *     con las claves del registro como variables (p. ej. `edad >= 18`).
 *     Limitación: la condición no puede contener paréntesis.
 */

export type OperationConfig = { label: string; expression: string };
export type OperationResult = { label: string; result: number | string };

// FUNCION(variable) o FUNCION(variable, condicion)
const FN_REGEX = /([A-Za-z_]\w*)\s*\(\s*([^,()]*?)\s*(?:,\s*([^()]+?)\s*)?\)/g;

const FUNCTIONS: Record<string, (values: number[]) => number> = {
  SUMAR: (v) => v.reduce((a, b) => a + b, 0),
  CONTAR: (v) => v.length,
  PROMEDIAR: (v) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0),
  MAX: (v) => (v.length ? Math.max(...v) : 0),
  MIN: (v) => (v.length ? Math.min(...v) : 0),
};

/** SUMARSI → SUMAR, CONTARSI → CONTAR, etc. */
const baseName = (op: string) => (op.endsWith("SI") ? op.slice(0, -2) : op);

const extractNumbers = (dataArray: any[], variable: string): number[] =>
  dataArray
    .map((entry) => entry?.[variable])
    .filter((val) => val !== null && val !== undefined && val !== "")
    .map(Number)
    .filter((val) => !isNaN(val));

const evalCondition = (record: any, condition: string): boolean => {
  try {
    const keys = Object.keys(record);
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `return ${condition};`);
    return fn(...keys.map((k) => record[k]));
  } catch {
    return false;
  }
};

const filterByCondition = (
  dataArray: any[],
  variable: string,
  condition: string
): number[] =>
  dataArray
    .filter((record) => evalCondition(record, condition))
    .map((record) => record?.[variable])
    .filter((val) => val !== null && val !== undefined && !isNaN(Number(val)))
    .map(Number);

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Evalúa una expresión completa contra el array de submissions.
 * Reemplaza cada FUNCION(...) por su valor numérico y después resuelve
 * la aritmética restante (solo dígitos y operadores, nunca código libre).
 */
export const evaluateExpression = (
  expression: string,
  submissions: any[]
): number | string => {
  if (!expression?.trim()) return "Sintaxis inválida";

  let unknownFn: string | null = null;
  let matchedAny = false;

  const replaced = expression.replace(
    FN_REGEX,
    (_full, name: string, variable: string, condition?: string) => {
      matchedAny = true;
      const fn = FUNCTIONS[baseName(name.toUpperCase())];
      if (!fn) {
        unknownFn = name;
        return "0";
      }
      const values = condition
        ? filterByCondition(submissions, variable, condition)
        : variable
        ? extractNumbers(submissions, variable)
        : [];
      return String(fn(values));
    }
  );

  if (unknownFn) return `Operación no reconocida: ${unknownFn}`;
  if (!matchedAny) return "Sintaxis inválida";

  // Lo que queda debe ser aritmética pura: números, operadores y paréntesis
  if (!/^[\d\s+\-*/().]*$/.test(replaced)) return "Sintaxis inválida";

  try {
    // eslint-disable-next-line no-new-func
    const value = new Function(`"use strict"; return (${replaced});`)();
    return typeof value === "number" && isFinite(value)
      ? round2(value)
      : "Sintaxis inválida";
  } catch {
    return "Sintaxis inválida";
  }
};

export const evaluateOperations = (
  operations: OperationConfig[],
  submissions: any[]
): OperationResult[] => {
  if (!operations?.length || !submissions?.length) return [];
  return operations.map((config) => ({
    label: config.label,
    result: evaluateExpression(config.expression, submissions),
  }));
};
