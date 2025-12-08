// src/components/Breadcrumbs.tsx
import { Link } from "react-router-dom";

// Mapa de traducción de rutas → nombres bonitos
const names: Record<string, string> = {
  "inicio": "Inicio",
  "dashboard": "Dashboard",
  "usuarios": "Usuarios",
  "instituciones": "Instituciones",
  "censos": "Censos",
  "graficador": "Graficador",
  "reportes": "Reportes",
  "ajustes": "Ajustes",
};

export default function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  // Generar las rutas acumuladas para poder hacer cada parte clickeable
  const buildPath = (index: number) =>
    "/" + parts.slice(0, index + 1).join("/");

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-neutral-500">
        {parts.map((part, index) => {
          const isLast = index === parts.length - 1;
          const label = names[part] ?? decodeURIComponent(part);

          return (
            <li key={index} className="flex items-center gap-2">
              {/* Separador "/" excepto en el primero */}
              {index > 0 && (
                <span className="text-neutral-400 select-none">/</span>
              )}

              {/* Último elemento → vino + negritas */}
              {isLast ? (
                <span className="text-[#7C1227] font-semibold">
                  {label}
                </span>
              ) : (
                <Link
                  to={buildPath(index)}
                  className="hover:text-neutral-700 transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
