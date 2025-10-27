import { BarChart3, Building2, Users } from "lucide-react";

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

        </div>

        {/* Columna imagen/hero */}
        <div className="relative">
          <div className="aspect-[4/3] md:aspect-[5/4] w-full overflow-hidden rounded-xl ring-1 ring-black/5 bg-[#F7F3E8]">
            {heroSrc ? (
              <img
                src="/public/HGO.png"
                alt="Mapa o ilustración del Estado de Hidalgo"
                className="h-full w-full object-contain md:object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-neutral-400 text-sm">
                
              </div>
            )}
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
