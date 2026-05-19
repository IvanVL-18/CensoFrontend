import type { CensusModuleItem } from "./charts";

const PALETTE = [
  "#9d7e43",
  "#7C1227",
  "#b3885b",
  "#4b7c8a",
  "#6b5b2e",
  "#c45c6a",
  "#3d7a5c",
  "#8b6914",
];

type Props = {
  modules: CensusModuleItem[];
  censusId: number;
};

export default function GeneralCharts({ modules, censusId }: Props) {
  const total = modules.reduce((sum, m) => sum + m.questions_count, 0);

  let cumulative = 0;
  const slices = modules.map((m, i) => {
    const percent = total > 0 ? (m.questions_count / total) * 100 : 0;
    const start = cumulative;
    cumulative += percent;
    return {
      ...m,
      percent,
      start,
      end: cumulative,
      color: PALETTE[i % PALETTE.length],
    };
  });

  const gradient = `conic-gradient(${slices
    .map((s) => `${s.color} ${s.start.toFixed(2)}% ${s.end.toFixed(2)}%`)
    .join(", ")})`;

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-1 border-b border-gray-200 pb-3">
        <h2 className="text-base sm:text-lg font-semibold text-[#4b1220]">
          Módulos del censo #{censusId}
        </h2>
        <p className="text-xs text-[#7b6670]">
          {modules.length} {modules.length === 1 ? "módulo" : "módulos"} · {total} preguntas en total
        </p>
      </header>

      {modules.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">
          No hay módulos para mostrar.
        </p>
      ) : (
        <article className="rounded-2xl overflow-hidden border border-black/5 shadow-sm">
          <div className="bg-[#7C1227] text-white px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-semibold">Distribución de preguntas por módulo</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">
              {total} preguntas
            </span>
          </div>

          <div className="p-6 flex flex-col lg:flex-row items-center gap-10">

            {/* Pastel */}
            <div className="relative shrink-0 h-56 w-56 sm:h-64 sm:w-64">
              <div
                className="h-full w-full rounded-full shadow-md"
                style={{ backgroundImage: gradient }}
              />
              {/* Hueco central más generoso */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="flex flex-col items-center justify-center rounded-full bg-white shadow-inner border border-black/5"
                  style={{ width: "46%", height: "46%" }}
                >
                  <p className="text-[11px] font-bold leading-tight text-[#4b1220]">{total}</p>
                  <p className="text-[9px] text-[#7b6670] leading-tight">preguntas</p>
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-col gap-1.5 w-full">
              {slices.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#F5F1EA] transition-colors"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-sm border border-black/10"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="flex-1 text-xs text-[#3b2a2e] truncate">
                    {s.module_name}
                  </span>
                  <div className="shrink-0 flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-[#4b1220]">
                      {s.questions_count}
                    </span>
                    <span className="text-[11px] text-[#7b6670]">
                      {s.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
