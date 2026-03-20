import { useState, useEffect, useRef, useCallback } from "react";
import { getquestionComponent } from "../Answers.service";

/* =========================================================
   ======================== TIPOS ==========================
   ========================================================= */

export type OperationConfig = {
  label: string;
  expression: string;
};

export type OperationResult = {
  label: string;
  result: number | string;
};

export type RepeatConfig = {
  repeat: boolean;
  data_repeat_type: "fixed" | "array";
  data_repeat_number?: number | string;
  data_repeat_config?: any[];
};

export type QuestionSchema = {
  components: any[];
  display?: string;
  repeat_config?: RepeatConfig;
  operations?: OperationConfig[];
  [key: string]: any;
};

export type QuestionMeta = {
  question: string;
  index: string;
  unit_name: string;
  section_name: string;
  questionary_year: string | number;
};

/* =========================================================
   ================== SANITIZACIÓN =========================
   ========================================================= */

const sanitizeComponents = (components: any[]): any[] =>
  components.map((comp) => {
    const s = { ...comp };
    if (s.inputMask === null)   s.inputMask   = "";
    if (s.displayMask === null) s.displayMask = "";
    if (Array.isArray(s.components)) s.components = sanitizeComponents(s.components);
    if (Array.isArray(s.columns))
      s.columns = s.columns.map((col: any) => ({
        ...col,
        components: sanitizeComponents(col.components ?? []),
      }));
    if (Array.isArray(s.rows))
      s.rows = s.rows.map((row: any[]) =>
        Array.isArray(row)
          ? row.map((cell: any) => ({
              ...cell,
              components: sanitizeComponents(cell.components ?? []),
            }))
          : row
      );
    return s;
  });

export const sanitizeSchema = (schema: QuestionSchema): QuestionSchema => ({
  ...schema,
  display: schema.display ?? "form",
  components: sanitizeComponents(schema.components ?? []),
});

/* =========================================================
   ================== MOTOR MATEMÁTICO =====================
   ========================================================= */

const parseExpression = (expression: string) => {
  const match = expression.match(/(\w+)\(([^,]*)(?:,\s*([^)]+))?\)/);
  if (!match) return null;
  return {
    operation: match[1].toUpperCase(),
    variable: match[2]?.trim() || null,
    condition: match[3]?.trim() || null,
  };
};

const extractNumbers = (dataArray: any[], variable: string): number[] =>
  dataArray
    .map((entry) => entry?.[variable])
    .filter((val) => val !== null && val !== undefined && val !== "")
    .map((val) => Number(val))
    .filter((val) => !isNaN(val));

const evalCondition = (record: any, condition: string): boolean => {
  try {
    const keys = Object.keys(record);
    const fn = new Function(...keys, `return ${condition};`);
    return fn(...keys.map((k) => record[k]));
  } catch {
    return false;
  }
};

const filterByCondition = (dataArray: any[], variable: string, condition: string): number[] =>
  dataArray
    .filter((record) => evalCondition(record, condition))
    .map((record) => record?.[variable])
    .filter((val) => val !== null && val !== undefined && !isNaN(Number(val)))
    .map(Number);

export const evaluateOperations = (
  operations: OperationConfig[],
  submissions: any[]
): OperationResult[] => {
  if (!operations?.length || !submissions?.length) return [];
  return operations.map((config) => {
    const parsed = parseExpression(config.expression);
    if (!parsed) return { label: config.label, result: "Sintaxis inválida" };
    const { operation, variable, condition } = parsed;
    const values =
      condition !== null && variable
        ? filterByCondition(submissions, variable, condition!)
        : variable
        ? extractNumbers(submissions, variable)
        : [];
    let result: number | string;
    switch (operation) {
      case "SUMAR":    case "SUMARSI":    result = values.reduce((a, b) => a + b, 0); break;
      case "CONTAR":   case "CONTARSI":   result = values.length; break;
      case "PROMEDIAR": case "PROMEDIARSI":
        result = values.length
          ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
          : 0;
        break;
      case "MAX": case "MAXSI": result = values.length ? Math.max(...values) : 0; break;
      case "MIN": case "MINSI": result = values.length ? Math.min(...values) : 0; break;
      default: result = "Operación no reconocida";
    }
    return { label: config.label, result };
  });
};

/* =========================================================
   ======================= HOOKS ===========================
   ========================================================= */

export const useFormSchema = (questionId: string | number | null) => {
  const [schema, setSchema]           = useState<QuestionSchema | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([{}]);
  const [operations, setOperations]   = useState<OperationConfig[]>([]);
  const [meta, setMeta]               = useState<QuestionMeta | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const disableCalculatedFields = useCallback((components: any[]): any[] => {
    if (!Array.isArray(components)) return [];
    return components.map((comp: any) => {
      const c = { ...comp };
      if (c.calculateValue && typeof c.calculateValue === "string" && c.calculateValue.trim() !== "") {
        c.disabled = true;
      }
      if (Array.isArray(c.components)) c.components = disableCalculatedFields(c.components);
      return c;
    });
  }, []);

  const buildSubmissions = useCallback((repeatConfig?: RepeatConfig): any[] => {
    if (!repeatConfig?.repeat) return [{}];
    if (repeatConfig.data_repeat_type === "fixed") {
      const total = parseInt(String(repeatConfig.data_repeat_number ?? "1")) || 1;
      return Array.from({ length: total }, () => ({}));
    }
    if (repeatConfig.data_repeat_type === "array") {
      const items = repeatConfig.data_repeat_config;
      return Array.isArray(items) && items.length > 0
        ? items.map((item: any) => ({ ...item }))
        : [{}];
    }
    return [{}];
  }, []);

  useEffect(() => {
    if (!questionId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getquestionComponent(questionId, controller.signal)
      .then((res) => {
        if (!res?.question_structure) throw new Error("Estructura vacía.");



        let parsed: QuestionSchema =
          typeof res.question_structure === "string"
            ? JSON.parse(res.question_structure)
            : { ...res.question_structure };

        parsed = sanitizeSchema(parsed);
        if (parsed.components) parsed = { ...parsed, components: disableCalculatedFields(parsed.components) };

        setSubmissions(buildSubmissions(parsed.repeat_config));
        setOperations(parsed.operations ?? []);
        setSchema(parsed);
      })
      .catch((err: any) => {
        if (err.name !== "AbortError" && err.message !== "canceled") {
          setError(err.message || "Error al cargar la estructura.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [questionId, disableCalculatedFields, buildSubmissions]);

  return { schema, submissions, setSubmissions, operations, meta, loading, error };
};

export const useRepeatNavigation = (
  submissions: any[],
  setSubmissions: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const currentDataRef = useRef<any>({});

  useEffect(() => {
    setCurrentIndex(0);
    currentDataRef.current = submissions[0] ?? {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions.length]);

  const handleChange = useCallback((event: any) => {
    if (event?.changed) {
      currentDataRef.current = { ...event.data };
      setRenderTrigger((t) => t + 1);
    }
  }, []);

  const commitAndNavigate = useCallback(
    (direction: 1 | -1) => {
      const fromIndex = currentIndex;
      const toIndex   = currentIndex + direction;
      if (toIndex < 0 || toIndex >= submissions.length) return;
      setSubmissions((prev) => {
        const copy = [...prev];
        copy[fromIndex] = { ...currentDataRef.current };
        return copy;
      });
      setCurrentIndex(toIndex);
      currentDataRef.current = submissions[toIndex] ?? {};
    },
    [currentIndex, submissions, setSubmissions]
  );

  const commitCurrent = useCallback((): any[] => {
    const final = [...submissions];
    final[currentIndex] = { ...currentDataRef.current };
    return final;
  }, [currentIndex, submissions]);

  return {
    currentIndex,
    renderTrigger,
    currentDataRef,
    handleChange,
    commitAndNavigate,
    commitCurrent,
    submissionForPage: { data: submissions[currentIndex] ?? {} },
  };
};