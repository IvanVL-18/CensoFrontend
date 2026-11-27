import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

const PROGRESS_PATH = "/admin/cuadernos/avance";

/** Barra guinda con el título y las pestañas de la carga de cuadernos. */
export function WorkbooksHeader({ subtitle }: { subtitle?: string }) {
  const { pathname } = useLocation();
  // El detalle de un archivo cuelga de la recepción.
  const onProgress = pathname.startsWith(PROGRESS_PATH);

  const tabs = [
    { to: "/admin/cuadernos", label: "Recepción", active: !onProgress },
    { to: PROGRESS_PATH, label: "Avance por edición", active: onProgress },
  ];

  return (
    <div className="bg-[var(--pantone-7421)] px-4 pt-4 text-white">
      <h1 className="text-xl font-bold md:text-2xl">Cuadernos del INEGI</h1>
      {subtitle && <p className="mt-1 text-sm text-white/80">{subtitle}</p>}

      <nav className="mt-3 flex gap-1" aria-label="Secciones de la carga de cuadernos">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={tab.active ? "page" : undefined}
            className={clsx(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition",
              tab.active
                ? "bg-white text-[var(--pantone-7421)]"
                : "text-white/85 hover:bg-white/10 hover:text-white",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
