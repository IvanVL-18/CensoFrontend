import type { Census } from "../census.types";

type Props = {
  census: Census;
  onView: (census: Census) => void;
};

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

export default function CensusCard({ census, onView }: Props) {
  const isActive = !!census.is_active;

  const status = isActive ? "Activo" : "Inactivo";
  const year = census.init_date ? new Date(census.init_date).getFullYear() : "2024";
  const startDate = formatDate(census.init_date);
  const endDate = formatDate(census.deadline);

  return (
    <article
      className="
        group relative overflow-hidden
        rounded-2xl bg-white
        border border-neutral-200
        shadow-sm
        transition
        hover:shadow-md hover:border-neutral-300
      "
    >
      {/* Acento vino fino */}
      <div className="absolute inset-y-0 left-0 w-1 bg-[#7C1227]" />

      <header className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3
              className="text-[15px] font-semibold leading-snug text-neutral-900 line-clamp-2"
              title={census.name}
            >
              {census.name}
            </h3>

            <div className="mt-1 text-xs font-medium text-neutral-500">
              {year}
            </div>
          </div>

          <span
            className={[
              "shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold",
              "ring-1 ring-inset",
              isActive
                ? "bg-[#0B7A63]/10 text-[#0B7A63] ring-[#0B7A63]/25"
                : "bg-[#7C1227]/10 text-[#7C1227] ring-[#7C1227]/25",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={[
                "h-1.5 w-1.5 rounded-full",
                isActive ? "bg-[#0B7A63]" : "bg-[#7C1227]",
              ].join(" ")}
            />
            {status}
          </span>
        </div>
      </header>

      <section className="px-6 pb-6">
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="grid grid-cols-2">
            <div className="p-4">
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                Inicio
              </div>
              <div className="mt-1 tabular-nums text-sm font-semibold text-neutral-900">
                {startDate}
              </div>
            </div>

            <div className="p-4 border-l border-neutral-200 text-right">
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                Fin
              </div>
              <div className="mt-1 tabular-nums text-sm font-semibold text-neutral-900">
                {endDate}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onView(census)}
          className="
            mt-4 w-full
            inline-flex items-center justify-center
            rounded-xl px-4 py-2.5
            text-sm font-semibold text-white
            bg-[#7C1227]
            shadow-sm
            transition
            hover:bg-[#5a0e1a]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C1227]/35
            active:translate-y-[0.5px]
          "
        >
          Ver censo
        </button>
      </section>
    </article>
  );
}
