import type { CensusModuleItem } from "./charts";

const BAR_MAX_PX = 148;

type Props = {
  modules: CensusModuleItem[];
  censusId: number;
};

export default function GeneralCharts({ modules, censusId }: Props) {
  const max = Math.max(...modules.map((m) => m.questions_count), 1);
  const normalized = modules.map((m) => ({
    ...m,
    barPx: Math.max((m.questions_count / max) * BAR_MAX_PX, 4),
    percent: (m.questions_count / max) * 100,
  }));

  const total = modules.reduce((sum, m) => sum + m.questions_count, 0);

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-1 border-b border-gray-200 pb-3">
        <h2 className="text-base sm:text-lg font-semibold text-[#4b1220]">
          Módulos del censo #{censusId}
        </h2>
        <p className="text-xs text-[#7b6670]">
          {modules.length} {modules.length === 1 ? "módulo" : "módulos"} ·{" "}
          {total} preguntas en total
        </p>
      </header>

      {modules.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">
          No hay módulos para mostrar.
        </p>
      ) : (
        <article className="rounded-2xl overflow-hidden border border-black/5 shadow-sm flex flex-col">
          <div className="bg-[#7C1227] text-white px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Preguntas por módulo</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
              {modules.length} módulos
            </span>
          </div>

          <div className="p-4 flex flex-col gap-3">
            <p className="text-xs text-[#6b555c]">
              Número de preguntas asignadas a cada módulo. La altura de cada
              barra representa el porcentaje respecto al módulo con mayor número
              de preguntas.
            </p>

            <div className="w-full overflow-x-auto">
              <div
                className="relative h-60 px-4 sm:px-6 pt-4"
                style={{ minWidth: `${Math.max(modules.length * 80, 320)}px` }}
              >
                {/* Eje Y */}
                <div className="absolute inset-0 flex flex-col justify-between py-4">
                  {[100, 75, 50, 25, 0].map((tick) => (
                    <div key={tick} className="flex items-center gap-2">
                      <span className="w-8 text-[10px] text-right text-[#7b6670]">
                        {tick}%
                      </span>
                      <div className="h-px flex-1 bg-gray-200/80" />
                    </div>
                  ))}
                </div>

                {/* Barras */}
                <div className="relative h-full pl-10 flex items-end justify-around gap-3 pb-6">
                  {normalized.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex flex-col items-center gap-1 flex-1 min-w-[60px]"
                    >
                      <span className="text-[10px] font-semibold text-[#4b1220]">
                        {mod.questions_count}
                      </span>
                      <div
                        className="w-10 rounded-t-lg bg-[#9d7e43] shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_12px_rgba(157,126,67,0.45)]"
                        style={{ height: `${mod.barPx}px` }}
                      />
                      <span className="mt-1 text-[10px] sm:text-[11px] text-center text-[#4b3b3f] leading-tight">
                        {mod.module_name}
                      </span>
                    </div>
                  ))}
                </div>

                <span className="absolute bottom-0 right-6 text-[11px] text-[#7C1227]/80">
                  Preguntas
                </span>
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
