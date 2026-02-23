// src/pages/census/CensusDetail.tsx
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Census } from "./census.types";
/* import CensusQuestions from "./CensusQuestionsPage"; */

type Props = {
  census: Census;
  onBack: () => void;
};

type ViewMode = "summary" | "questions";

function formatDate(value: string | null): string {
  if (!value) return "---";

  const d = new Date(value);
  if (isNaN(d.getTime())) return value;

  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CensusDetail({ census, onBack }: Props) {
  const [view, setView] = useState<ViewMode>("summary");

  const year = census.init_date ? new Date(census.init_date).getFullYear() : "2024";
  const startDate = formatDate(census.init_date);
  const endDate = formatDate(census.deadline);
  const totalQuestions = census.questions_count ?? 0;

  const percentage = 100;

  return (
    <div className="w-full space-y-4 lg:space-y-6">
      <div className="flex items-center justify-start">
        <button
          type="button"
          onClick={onBack}
          className="
            inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
            text-sm border border-gray-300 text-gray-700 bg-white
            hover:bg-gray-100 transition-colors
          "
        >
          <ArrowLeft className="w-4 h-4" />
          Regresaraaa
        </button>
      </div>

      {/* {view === "questions" ? (
        <CensusQuestions census={census} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div
              className="
                bg-white rounded-2xl border border-gray-200
                shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                overflow-hidden
              "
            >
              <div
                className="
                  bg-[var(--pantone-7421)]
                  text-white px-5 py-3.5
                  flex items-start justify-between gap-3
                "
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold leading-snug">
                    {census.name}
                  </div>
                </div>

                <span className="mt-1">
                  <span className="w-2.5 h-2.5 block rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]" />
                </span>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className="
                      inline-flex items-center px-3 py-0.5 rounded-full
                      text-[11px] font-medium
                      bg-emerald-50 text-emerald-700
                      border border-emerald-200
                    "
                  >
                    Creado
                  </span>

                  <span
                    className="
                      inline-flex items-center px-3 py-0.5 rounded-full
                      text-[11px] font-medium
                      bg-neutral-900 text-neutral-100
                    "
                  >
                    {year}
                  </span>
                </div>

                <div
                  className="
                    bg-neutral-50 rounded-xl border border-gray-200
                    px-4 py-3 grid grid-cols-3 gap-4 text-[11px]
                    text-neutral-700
                  "
                >
                  <div>
                    <div className="font-semibold text-neutral-800">Inicio</div>
                    <div className="mt-[2px] tabular-nums">{startDate}</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-800">Fin</div>
                    <div className="mt-[2px] tabular-nums">{endDate}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-neutral-800">Preguntas</div>
                    <div className="mt-[2px] tabular-nums">{totalQuestions}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 1, label: "Unidades" },
                { id: 2, label: "Secciones" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 3) setView("questions");
                  }}
                  className="
                    w-full bg-white rounded-2xl border border-gray-200
                    px-4 py-3 flex items-center justify-between
                    text-sm text-neutral-800
                    hover:bg-gray-50 hover:border-gray-300
                    transition-colors
                  "
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{item.id}.</span>
                    <span className="font-medium">{item.label}</span>
                  </span>

                  <span
                    className="
                      inline-flex items-center justify-center
                      w-8 h-8 rounded-full bg-emerald-500
                      text-white
                    "
                  >
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="
              bg-white rounded-2xl border border-gray-200
              shadow-[0_4px_12px_rgba(0,0,0,0.06)]
              p-5 flex flex-col
            "
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-800">
                Porcentaje del censo
              </h3>
              <span className="text-[11px] text-neutral-500">Total de preguntas</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-indigo-500" />
                <div className="absolute w-24 h-24 rounded-full bg-gray-50" />
                <span className="absolute text-sm font-semibold text-neutral-800">
                  {percentage}%
                </span>
              </div>

              <div className="text-center space-y-1">
                <div className="text-xs text-neutral-500">Total de preguntas</div>
                <div className="text-lg font-semibold text-neutral-800">
                  {totalQuestions}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-600">
              <span className="inline-flex w-3 h-3 rounded-sm bg-indigo-500" />
              <span>Total de preguntas del censo</span>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
