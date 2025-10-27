import React from "react";
import type { Institution, SortDir, SortKey } from "../types";

type Props = {
  rows: Institution[];
  sortKey?: SortKey;              // si tu API ya ordena, no los uses
  sortDir?: SortDir;
  onChangeSort?: (key: SortKey) => void;
  startIndex?: number;
  onToggleMostrar?: (r: Institution) => void;
  onView?: (r: Institution) => void;
  onEdit?: (r: Institution) => void;
  onDelete?: (r: Institution) => void;
};

const SortableTh = ({
  label, active, dir, onClick, className = "",
}: { label: string; active?: boolean; dir?: SortDir; onClick?: () => void; className?: string }) => (
  <th
    className={`py-3 px-4 ${onClick ? "cursor-pointer select-none" : ""} whitespace-nowrap ${className}`}
    onClick={onClick}
  >
    <div className="inline-flex items-center gap-1">
      <span>{label}</span>
      {onClick && <span className="text-[10px] opacity-80">{active ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>}
    </div>
  </th>
);

function InstitutionsTableBase({
  rows,
  sortKey,
  sortDir,
  onChangeSort,
  startIndex = 0,
  onToggleMostrar,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#f7f3e8] text-sm text-[#420c1a]">
            <tr className="border-b border-[#e9dfd5]">
              <th className="py-3 px-4 w-12">#</th>
              <SortableTh label="Nombre"   active={sortKey === "nombre"}   dir={sortDir} onClick={() => onChangeSort?.("nombre")} />
              <th className="py-3 px-4">Geocodigo</th>
              <SortableTh label="Municipio" active={sortKey === "municipio"} dir={sortDir} onClick={() => onChangeSort?.("municipio")} />
              <SortableTh label="Tipo"      active={sortKey === "tipo"}      dir={sortDir} onClick={() => onChangeSort?.("tipo")} />
              <th className="py-3 px-4 text-center">Mostrar</th>
              <th className="py-3 px-4 text-center">Opciones</th>
            </tr>
          </thead>

          <tbody className="text-sm text-neutral-800">
            {rows.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-neutral-400">Sin resultados</td></tr>
            )}

            {rows.map((r, i) => (
              <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors">
                <td className="py-3 px-4 text-neutral-500">{startIndex + i + 1}</td>
                <td className="py-3 px-4">{r.nombre}</td>
                <td className="py-3 px-4">
                  {r.geocodigo ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 px-2 py-1 text-xs ring-1 ring-emerald-200">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><rect x="5" y="5" width="4" height="14" rx="1"/><rect x="11" y="5" width="4" height="14" rx="1"/></svg>
                      {r.geocodigo}
                    </span>
                  ) : <span className="text-neutral-400 text-xs">—</span>}
                </td>
                <td className="py-3 px-4">{r.municipio}</td>
                <td className="py-3 px-4">{r.tipo}</td>

                <td className="py-3 px-4">
                  <div className="flex justify-center">
                    <button
                      onClick={() => onToggleMostrar?.(r)}
                      className={`h-8 w-8 grid place-items-center rounded-full transition ${
                        r.mostrar ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                      title={r.mostrar ? "Visible" : "Oculta"}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
                      </svg>
                    </button>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="h-8 w-8 grid place-items-center rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 transition"  title="Ver"     onClick={() => onView?.(r)}  >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Z"/></svg>
                    </button>
                    <button className="h-8 w-8 grid place-items-center rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition" title="Editar"  onClick={() => onEdit?.(r)} >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
                    </button>
                    <button className="h-8 w-8 grid place-items-center rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 transition"   title="Eliminar" onClick={() => onDelete?.(r)} >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Z"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(InstitutionsTableBase);
