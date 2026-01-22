import type { LucideIcon } from "lucide-react";

export type StatCardColor = "blue" | "green" | "cyan";

export type StatCardItem = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: StatCardColor;
};

export type QuestionnaireItem = {
  id: string;
  name: string;
};

export type DonutItem = {
  label: string;
  value: number;
};

export type BarItem = {
  label: string;
  value: number;
};
