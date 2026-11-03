import { MapPin } from "lucide-react";

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/CITNOVA/", label: "Facebook", icon: "fab fa-facebook-f" },
  { href: "https://x.com/CITNOVA", label: "X", icon: "fab fa-x-twitter" },
];

type Props = { className?: string };

export default function Footer({ className = "" }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`mt-auto w-full shrink-0 border-t-4 border-[#C79D63] bg-[#5A1629] text-[#f3e9da] ${className}`}
    >
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 px-6 py-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-3 lg:gap-12">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <img
            src="/Hidalgo_log.svg"
            alt="Escudo del Estado de Hidalgo"
            className="h-12 w-auto object-contain"
            draggable={false}
          />
          <p className="max-w-xs text-sm leading-relaxed text-[#f3e9da]/80">
            Censo Nacional de Gobiernos Estatales
          </p>
        </div>

        {/* Ubicación */}
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C79D63]">
            Ubicación
          </h3>
          <address className="flex items-start gap-2 text-sm not-italic leading-relaxed">
            <MapPin size={18} className="mt-0.5 shrink-0 text-[#C79D63]" aria-hidden="true" />
            <span>
              CITNOVA | Edificio Innovación
              <br />
              Boulevard Circuito La Concepción #3
              <br />
              Col. La Concepción, CP 42162
              <br />
              San Agustín Tlaxiaca, Hidalgo
            </span>
          </address>
        </div>

        {/* Redes sociales */}
        <div className="flex flex-col items-center gap-3 sm:col-span-2 lg:col-span-1 lg:items-end">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C79D63]">
            Síguenos
          </h3>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C79D63]/40 text-[#f3e9da] transition-colors hover:border-[#C79D63] hover:bg-[#C79D63] hover:text-[#5A1629] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C79D63]"
              >
                <i className={`${icon} text-base`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-[#DDC9A3]/15">
        <p className="mx-auto max-w-screen-xl px-6 py-4 text-center text-xs text-[#f3e9da]/70">
          © {year} Gobierno del Estado de Hidalgo. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
