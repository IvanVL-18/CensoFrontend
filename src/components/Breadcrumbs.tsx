import { Link } from "react-router-dom";

const names: Record<string, string> = {
  "inicio": "Inicio",
  "dashboard": "Dashboard",
  "usuarios": "Usuarios",
  "instituciones": "Instituciones",
  "censos": "Censos",
  "graficador": "Graficador",
  "reportes": "Reportes",
  "configuracion": "Configuración",
  "modulos": "Módulos",
  "secciones": "Secciones",
  "ocupaciones": "Ocupaciones",
  "indices": "Índices",
  "dependency": "Dependencias",
  "preguntas": "Preguntas",
  "roles": "Roles",
  "catalogos": "Catálogos",
  "permisos": "Permisos",
  "permission-roles": "Asignar Permisos",
  "categorias": "Categorías",
  
};

export default function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);

  
  const visibleParts = parts.filter(part => names[part] || names[part.toLowerCase()]);

 
  if (visibleParts.length === 0) return null;

  const buildPath = (index: number) => {
    const originalIndex = parts.findIndex(p => p === visibleParts[index]);
    return "/" + parts.slice(0, originalIndex + 1).join("/");
  };

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-neutral-500">
        {visibleParts.map((part, index) => {
          const isLast = index === visibleParts.length - 1;
          const label = names[part] || names[part.toLowerCase()];

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-neutral-400 select-none">/</span>}
              {isLast ? (
                <span className="text-[var(--pantone-7421)] font-semibold">{label}</span>
              ) : (
                <Link to={buildPath(index)} className="hover:text-neutral-700 transition-colors">
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