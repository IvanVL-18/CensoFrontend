import '/src/assets/global-variables.css';
import { BarChart3, Building2, Users } from "lucide-react";

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
        px-8 py-10 md:px-12 md:py-12
        text-center
        shadow-sm
        space-y-6
      "
    >
      <div className="flex justify-center mt-2">
        <img
          src={logoSrc}
          alt="Logo institucional"
          className="h-14 md:h-40 w-auto object-contain"
          draggable={false}
        />
      </div>
      <p className="text-[11px] md:text-[15px] tracking-[0.28em] uppercase text-neutral-500 flex items-center justify-center gap-3">
        <span className="hidden md:inline-block h-px w-8 bg-neutral-300" />
        Bienvenidos{userName ? ` · ${userName}` : ""}
        <span className="hidden md:inline-block h-px w-8 bg-neutral-300" />
      </p>

      <div className="space-y-3 max-w-3xl mx-auto">
        <h1 className="text-[26px] md:text-[34px] lg:text-[38px] font-semibold text-[#5F0F1B] leading-tight">
          {title}
        </h1>

        <p className="text-[13px] md:text-[16px] text-neutral-600 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="h-px w-full max-w-4xl mx-auto bg-neutral-200 mt-2" />

      <div className="flex justify-center mt-2 gap-10 items-center">
        <img
          src="/SNIEG.svg"
          alt="Logo SNIEG"
          className="h-12 md:h-16 object-contain"
        />

        <img
          src="/INEGI.svg"
          alt="Logo INEGI"
          className="h-10 md:h-12 object-contain"
        />
      </div>
    </section>
  );
}
