import { MoreVertical } from "lucide-react";
import clsx from "clsx";

export type Encuestado = {
  id: string | number;
  name: string;
  curp: string;
  municipio: string;
  status: "Activo" | "Inactivo";
};

type SortKey = keyof Pick<Encuestado, "name" | "curp" | "municipio" | "status">;

type Props = {
  rows: Encuestado[];
  loading?: boolean;
  onView?: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
};

export default function EncuestadosTable({
  rows,
  loading,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const headCell = (label: string, k?: SortKey) => (
    <th
      className={clsx(
        "px-4 py-3 text-left text-[13px] font-semibold text-[#3b2a2e]",
        k && "cursor-default"
      )}
      scope="col"
    >
      {label}
    </th>
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-black/5 bg-white p-6">
        <div className="h-4 w-40 bg-black/5 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-black/5/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-black/5 bg-white p-12 text-center">
        <p className="text-[#3b2a2e] font-medium">Sin encuestados</p>
        <p className="text-sm text-[#3b2a2e]/70">
          Selecciona filtros o agrega nuevos registros.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/5 bg-white">
      <table className="w-full border-collapse">
        <thead className="bg-[#F5F1EA]">
          <tr>
            {headCell("Nombre")}
            {headCell("CURP")}
            {headCell("Municipio")}
            {headCell("Estatus")}
            <th className="px-4 py-3 text-right text-[13px] font-semibold text-[#3b2a2e]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-t border-black/5 hover:bg-black/5/10"
            >
              <td className="px-4 py-3 text-[13px] text-[#3b2a2e]">{r.name}</td>
              <td className="px-4 py-3 text-[13px] text-[#3b2a2e] tracking-wide">
                {r.curp}
              </td>
              <td className="px-4 py-3 text-[13px] text-[#3b2a2e]">
                {r.municipio}
              </td>
              <td className="px-4 py-3">
                <span
                  className={clsx(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[12px]",
                    r.status === "Activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-2 py-2">
                <div className="flex justify-end">
                  <button
                    className="rounded-md p-2 hover:bg-black/5"
                    aria-label="Acciones"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </div>
                <div className="sr-only">
                  <button onClick={() => onView?.(r.id)}>Ver</button>
                  <button onClick={() => onEdit?.(r.id)}>Editar</button>
                  <button onClick={() => onDelete?.(r.id)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
