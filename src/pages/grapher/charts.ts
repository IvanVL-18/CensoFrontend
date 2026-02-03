// src/types/charts.ts
export type ChartKind = "general" | "cuestionario";

export type GeneralSummary = {
  totalQuestions: number;
  mappedQuestions: number;
};

export type InstitutionStat = {
  name: string;
  value: number; // número de preguntas
};
