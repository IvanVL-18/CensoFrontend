import { ArrowRight, BarChart3, Building2, Users } from "lucide-react";

type Props = {
  title?: string;
  subtitle?: string;
  userName?: string;
  onPrimaryClick?: () => void;
  // imágenes (ponlas en /public/img)
  emblemSrc?: string;        // p.ej. "/img/escudo-hidalgo.svg" o "/estrella.png"
  heroSrc?: string;          // p.ej. "/img/hidalgo-mapa.png"
};

export default function WelcomeCard({
  title = "Bienvenido al Sistema de Censos del Estado de Hidalgo",
  subtitle = "Plataforma oficial para la gestión, registro y análisis de censos.",
  userName,
  onPrimaryClick,
  emblemSrc = "/estrella.png",
  heroSrc = "/img/HGO.png",
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(0,0,0,.08)]">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-[#5F0F1B]/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#C9A54C]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.6),_transparent_60%)]" />
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-10">
        {/* Columna texto */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            {emblemSrc && (
              <img
                src={emblemSrc}
                alt="Escudo del Estado de Hidalgo"
                className="h-14 w-14 md:h-16 md:w-16 object-contain"
              />
            )}
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-[#5F0F1B]">
                {title}
              </h2>
              <p className="text-sm md:text-base text-neutral-600">
                {subtitle} {userName ? <span className="font-medium text-neutral-700">| {userName}</span> : null}
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <KpiChip icon={<Users className="h-4 w-4" />} label="Usuarios" value="22,205" />
            <KpiChip icon={<Building2 className="h-4 w-4" />} label="Instituciones" value="1,284" />
            <KpiChip icon={<BarChart3 className="h-4 w-4" />} label="Censos activos" value="37" />
          </div>

          {/* CTA + enlaces rápidos */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onPrimaryClick}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5F0F1B] px-4 py-2 text-white hover:bg-[#7A1828] focus:outline-none focus:ring-2 focus:ring-[#C9A54C]/60"
            >
              Ir al Dashboard <ArrowRight className="h-4 w-4" />
            </button>
            <a href="/censos" className="text-sm underline-offset-4 hover:underline text-[#5F0F1B]">
              Ver censos
            </a>
            <a href="/graficador" className="text-sm underline-offset-4 hover:underline text-[#5F0F1B]">
              Graficador
            </a>
            <a href="/usuarios" className="text-sm underline-offset-4 hover:underline text-[#5F0F1B]">
              Usuarios
            </a>
          </div>

          {/* Nota actualización */}
          <p className="text-xs text-neutral-500">
            Última actualización: octubre 2025 · Transparencia y eficiencia en la información estatal.
          </p>
        </div>

        {/* Columna imagen/hero */}
        <div className="relative">
          <div className="aspect-[4/3] md:aspect-[5/4] w-full overflow-hidden rounded-xl ring-1 ring-black/5 bg-[#F7F3E8]">
            {heroSrc ? (
              <img
                src="/src/assets/HGO.png"
                alt="Mapa o ilustración del Estado de Hidalgo"
                className="h-full w-full object-contain md:object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-neutral-400 text-sm">
                
              </div>
            )}
          </div>
          {/* Tarjeta flotante mini */}
          <div className="absolute -bottom-3 right-2 md:right-4 rounded-lg bg-white/90 backdrop-blur px-3 py-2 shadow-lg ring-1 ring-black/5">
            <div className="text-[10px] uppercase tracking-wide text-neutral-500">Progreso general</div>
            <div className="mt-1 h-1.5 w-40 overflow-hidden rounded bg-neutral-200">
              <div className="h-full w-3/4 bg-[#C9A54C]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#F7F3E8] px-3 py-2 ring-1 ring-black/5">
      <span className="text-[#5F0F1B]">{icon}</span>
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
        <div className="text-sm font-semibold text-neutral-800">{value}</div>
      </div>
    </div>
  );
}
