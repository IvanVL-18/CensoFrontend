import type { GeneralSummary, InstitutionStat } from "../../grapher/components/charts";

type Props = {
  summary: GeneralSummary;
  institutions: InstitutionStat[];
};

export default function GeneralCharts({ summary, institutions }: Props) {
  const { totalQuestions, mappedQuestions } = summary;

  const mappedPercent =
    totalQuestions > 0 ? (mappedQuestions / totalQuestions) * 100 : 0;

  const max = Math.max(...institutions.map((i) => i.value), 1);
  const normalized = institutions.map((i) => ({
    ...i,
    percent: (i.value / max) * 100,
  }));

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-3">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-[#4b1220]">
            Gráficas generales
          </h2>
          <p className="text-xs text-[#7b6670]">
            Panorama global del total de preguntas ({totalQuestions}) y las
            maquetadas ({mappedQuestions}).
          </p>
        </div>
      </header>

      {/* GRID */}
      <section className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* TARJETA 1 */}
        <article className="rounded-2xl overflow-hidden border border-black/5 shadow-sm flex flex-col">
          <div className="bg-[#7C1227] text-white text-sm font-semibold px-4 py-2">
            Gráfica general
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4">
            <p className="text-xs text-[#6b555c]">
              Relación entre el total de preguntas registradas y las ya
              maquetadas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="space-y-2 text-xs text-[#3b2a2e]">
                <LegendItem color="#22c55e" label="Total de preguntas" />
                <LegendItem color="#ef4444" label="Maquetadas" />
                <p className="mt-2 text-[11px] text-[#7b6670]">
                  {mappedPercent.toFixed(1)}% de las preguntas están maquetadas.
                </p>
              </div>

              <div
                className="rounded-full border border-black/10 shadow-inner
                           h-36 w-36 sm:h-40 sm:w-40"
                style={{
                  backgroundImage: `conic-gradient(
                    #ef4444 0 ${mappedPercent}%,
                    #22c55e ${mappedPercent}% 100%
                  )`,
                }}
              />
            </div>
          </div>
        </article>

        {/* TARJETA 2 */}
        <article className="rounded-2xl overflow-hidden border border-black/5 shadow-sm flex flex-col">
          <div className="bg-[#7C1227] text-white px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm font-semibold">
              Graficador general de instituciones
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="rounded-full bg-white/10 px-2 py-0.5">
                {institutions.length} instituciones
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4">
            <p className="text-xs text-[#6b555c]">
              Comparativo del número de preguntas por institución. La altura de
              cada barra representa el porcentaje respecto a la institución con
              mayor número de preguntas.
            </p>

            {/* ✅ Responsive: si hay muchas barras, permite scroll horizontal */}
            <div className="w-full overflow-x-auto">
              <div className="relative h-52 px-4 sm:px-6 pt-4 min-w-[520px]">
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
                <div className="relative h-full pl-10 flex items-end justify-between gap-4">
                  {normalized.map((inst) => (
                    <div
                      key={inst.name}
                      className="flex flex-col items-center gap-1 pb-2 flex-1"
                    >
                      <span className="text-[10px] font-semibold text-[#4b1220]">
                        {inst.value}
                      </span>

                      <div
                        className="w-9 sm:w-10 rounded-t-lg bg-[#b3885b] shadow-md transition-transform duration-200 hover:scale-[1.03]"
                        style={{ height: `${inst.percent}%` }}
                      />

                      <span className="mt-1 whitespace-pre-line text-[10px] sm:text-[11px] text-center text-[#4b3b3f]">
                        {inst.name}
                      </span>
                    </div>
                  ))}
                </div>

                <span className="absolute bottom-0 right-6 text-[11px] text-[#7C1227]/80">
                  Total de preguntas
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>
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
