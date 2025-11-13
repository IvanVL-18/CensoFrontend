type Props = {
  title?: string;
  subtitle?: string;
  userName?: string;
  onPrimaryClick?: () => void;
  heroSrc?: string;
  heroSrc2?: string;
};

export default function WelcomeCard({
  title = "Bienvenido al Sistema de Censos del Estado de Hidalgo",
  subtitle = "Plataforma oficial para la gestión, registro y análisis de censos.",
  userName,
  heroSrc = "/logo-inegi.png",
  heroSrc2 = "/SNIEG.png",
}: Props) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/30 p-10 text-center">
      <div className="flex items-center justify-center gap-14 mb-8">
        <img
          src={heroSrc}
          alt="Logo 1"
          className="h-15 w-auto object-contain"
          draggable={false}
        />

        <div className="h-15 w-[1px] bg-neutral-300" />

        <img
          src={heroSrc2}
          alt="Logo 2"
          className="h-25 w-auto object-contain"
          draggable={false}
        />
      </div>

      <div className="h-[1px] w-full bg-neutral-300 mb-10" />

      {/* --- TEXTO CENTRADO --- */}
      <h1 className="text-[30px] md:text-[40px] font-extrabold text-[#5F0F1B] leading-tight">
        {title}
      </h1>

      <p className="mt-4 text-[17px] md:text-[19px] text-neutral-700 leading-relaxed">
        {subtitle}
        {userName && (
          <span className="ml-1 text-[#5F0F1B] font-semibold">
            | {userName}
          </span>
        )}
      </p>
    </section>
  );
}
