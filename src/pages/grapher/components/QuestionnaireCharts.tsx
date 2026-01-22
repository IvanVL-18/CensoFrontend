// src/components/charts/QuestionnaireCharts.tsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Questionnaire = {
  id: string;
  name: string;
  totalQuestions: number;
  resolvedQuestions: number;
};

const QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "cng",
    name: "Censo Nacional de Gobierno",
    totalQuestions: 120,
    resolvedQuestions: 84,
  },
  {
    id: "cns",
    name: "Censo Nacional de Seguridad",
    totalQuestions: 95,
    resolvedQuestions: 60,
  },
  {
    id: "cnjp",
    name: "Censo Nacional de Justicia",
    totalQuestions: 150,
    resolvedQuestions: 110,
  },
];

export default function QuestionnaireCharts() {
  const [selectedId, setSelectedId] = useState<string>(QUESTIONNAIRES[0]?.id);

  const selected =
    QUESTIONNAIRES.find((q) => q.id === selectedId) ?? QUESTIONNAIRES[0];

  const { totalQuestions, resolvedQuestions } = selected;

  const percentResolved =
    totalQuestions > 0 ? (resolvedQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="space-y-4">
      <article className="rounded-2xl overflow-hidden border border-black/5 shadow-sm flex flex-col">
        {/* Header responsive */}
        <div className="bg-[#7C1227] text-white px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold">
            Elija un cuestionario para graficar
          </span>

          <div className="relative w-full sm:w-[360px]">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none rounded-lg bg-[#F5F1EA] text-[#3b2a2e] text-xs sm:text-sm pl-3 pr-8 py-2 border border-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F5F1EA] focus:border-white"
            >
              {QUESTIONNAIRES.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7C1227]" />
          </div>
        </div>

        {/* Contenido responsive */}
        <div className="p-4 flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          {/* Izquierda */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="space-y-2 text-xs text-[#3b2a2e]">
              <LegendItem color="#22c55e" label="Total de preguntas" />
              <LegendItem color="#ef4444" label="Porcentaje resuelto" />
            </div>

            <div className="text-[11px] text-[#7b6670] space-y-1">
              <p>
                Cuestionario seleccionado:{" "}
                <span className="font-semibold text-[#4b1220]">
                  {selected.name}
                </span>
              </p>
              <p>
                Preguntas totales:{" "}
                <span className="font-semibold">{totalQuestions}</span>
              </p>
              <p>
                Preguntas resueltas:{" "}
                <span className="font-semibold">{resolvedQuestions}</span> (
                {percentResolved.toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Derecha */}
          <div className="w-full lg:w-2/3 flex items-center justify-center">
            <div className="relative h-48 w-48 sm:h-56 sm:w-56 lg:h-60 lg:w-60">
              <div
                className="h-full w-full rounded-full border border-black/10 shadow-inner"
                style={{
                  backgroundImage: `conic-gradient(
                    #ef4444 0 ${percentResolved}%,
                    #22c55e ${percentResolved}% 100%
                  )`,
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-white/90 px-4 py-2 text-center shadow-md border border-black/5">
                  <p className="text-[10px] text-[#7b6670]">Porcentaje resuelto</p>
                  <p className="text-lg font-semibold text-[#4b1220]">
                    {percentResolved.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

type LegendItemProps = {
  color: string;
  label: string;
};

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-3 w-3 rounded-sm border border-black/10"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}
