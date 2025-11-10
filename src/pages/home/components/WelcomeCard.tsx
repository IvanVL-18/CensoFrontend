import '/src/assets/global-variables.css';
import { BarChart3, Building2, Users } from "lucide-react";

type Props = {
  title?: string;
  subtitle?: string;
  userName?: string;
  onPrimaryClick?: () => void;
  heroSrc?: string;  
};

export default function WelcomeCard({
  title = "Bienvenido al Sistema de Censos del Estado de Hidalgo",
  subtitle = "Plataforma oficial para la gestión, registro y análisis de censos.",
  userName,
  heroSrc = "/logo-inegi.png", 
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl shadow-[0_8px_28px_rgba(0,0,0,.08)]">
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-10">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
               <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-[#5F0F1B]" style={{ fontFamily: 'var(--primary-font)' }}>
                {title}
              </h2>
              <p className="text-sm md:text-base text-neutral-600">
                {subtitle} {userName ? <span className="font-medium text-neutral-700">| {userName}</span> : null}
              </p>
            </div>
          </div>

        </div>

        <div className="relative">
          <div className="aspect-[4/3] md:aspect-[5/4] w-full overflow-hidden rounded-xl ring-1 ring-black/5 bg-[#F7F3E8]">
            {heroSrc ? (
              <img
                src={heroSrc} 
                alt="lustración del Estado de Hidalgo"
                className="h-full w-full object-contain"
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
