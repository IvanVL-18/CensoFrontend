import "/src/assets/global-variables.css";

type Props = {
  title?: string;
  subtitle?: string;
  userName?: string;
  onPrimaryClick?: () => void;
  logoSrc?: string;
};

export default function WelcomeCard({
  title = "Censos del Estado de Hidalgo",
  subtitle = "Plataforma oficial para la gestión y análisis de censos",
  userName,
  logoSrc = "/Estrella_header.svg",
}: Props) {
  return (
    <section
      className="
        relative overflow-hidden
        rounded-2xl border border-neutral-200
        bg-white/80
        px-4 py-6
        sm:px-6 sm:py-8
        md:px-10 md:py-10
        lg:px-12 lg:py-12
        text-center
        shadow-sm
        space-y-5 sm:space-y-6
      "
    >
      {/* Logo principal */}
      <div className="flex justify-center">
        <img
          src={logoSrc}
          alt="Logo institucional"
          className="h-14 sm:h-16 md:h-28 lg:h-40 w-auto object-contain"
          draggable={false}
        />
      </div>

      {/* Bienvenida */}
      <p
        className="
          text-[10px] sm:text-[11px] md:text-[15px]
          tracking-[0.20em] sm:tracking-[0.28em]
          uppercase text-neutral-500
          flex items-center justify-center gap-2 sm:gap-3
          px-2
        "
      >
        <span className="hidden md:inline-block h-px w-8 bg-neutral-300" />
        Bienvenidos{userName ? ` · ${userName}` : ""}
        <span className="hidden md:inline-block h-px w-8 bg-neutral-300" />
      </p>

      {/* Título + subtítulo */}
      <div className="space-y-2 sm:space-y-3 max-w-3xl mx-auto">
        <h1 className="text-[20px] sm:text-[24px] md:text-[34px] lg:text-[38px] font-semibold text-[#5F0F1B] leading-tight">
          {title}
        </h1>

        <p className="text-[12px] sm:text-[13px] md:text-[16px] text-neutral-600 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="h-px w-full max-w-4xl mx-auto bg-neutral-200" />

      <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 items-center">
        <img
          src="/SNIEG.svg"
          alt="Logo SNIEG"
          className="h-10 sm:h-12 md:h-16 object-contain"
        />

        <img
          src="/INEGI.svg"
          alt="Logo INEGI"
          className="h-8 sm:h-10 md:h-12 object-contain"
        />
      </div>
    </section>
  );
}
