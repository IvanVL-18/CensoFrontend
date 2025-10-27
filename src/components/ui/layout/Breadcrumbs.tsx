const map: Record<string,string> = {
  "inicio":"Inicio",
  "dashboard":"Dashboard",
  "usuarios":"Usuarios",
  "instituciones":"Instituciones",
  "censos":"Censos",
  "graficador":"Graficador",
  "ejercicios-fiscales":"Ejercicios Fiscales",
  "ajustes":"Ajustes",
};

export default function Breadcrumbs({pathname}:{pathname:string}){
  const parts = pathname.split("/").filter(Boolean);
  if(parts.length === 0) return null;
  return (
    <nav className="text-sm">
      <ol className="flex items-center gap-2 text-neutral-500">
        {parts.map((p,i)=>(
          <li key={i} className="flex items-center gap-2">
            {i>0 && <span>/</span>}
            <span className={i===parts.length-1 ? "text-[#5F0F1B] font-medium":"hover:text-neutral-700"}>
              {map[p] ?? p}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
