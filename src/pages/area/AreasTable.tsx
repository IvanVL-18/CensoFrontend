// src/pages/area/AreasTable.tsx
import {
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  Building,
  type LucideProps,
} from "lucide-react";

import type { AreasTableProps } from "./Areas.interfaces";

const defaultProps = { strokeWidth: 1.75, size: 22 };

const IconSort = (props: LucideProps) => <ArrowUpDown {...defaultProps} {...props} />;
const IconView = (props: LucideProps) => <Eye {...defaultProps} {...props} />;
const IconEdit = (props: LucideProps) => <Edit {...defaultProps} {...props} />;
const IconDelete = (props: LucideProps) => <Trash2 {...defaultProps} {...props} />;
const IconCircleArrowUp = (props: LucideProps) => (
  <CircleArrowUp {...defaultProps} {...props} />
);
const IconBan = (props: LucideProps) => <Ban {...defaultProps} {...props} />;
const IconBuilding = (props: LucideProps) => <Building {...defaultProps} {...props} />;

export function AreasTable({
  areas,
  meta,
  loading,
  error,
  onSort,
  onView,
  onEdit,
  onBan,
  onRestore,
  onDelete,
}: AreasTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              <button
                type="button"
                onClick={() => onSort("id")}
                className="flex items-center space-x-1"
              >
                <span>No°</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            <th className="px-6 py-3 text-left w-1/2">
              <button
                type="button"
                onClick={() => onSort("name")}
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <span>Nombre</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            <th className="px-6 py-3 text-left w-1/2">
              <button
                type="button"
                onClick={() => onSort("institution_name")}
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <IconBuilding size={16} strokeWidth={2.5} className="mr-1" />
                <span>Institución</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Opciones
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {loading && (
            <tr>
              <td colSpan={4} className="text-center p-6 text-gray-500">
                Cargando...
              </td>
            </tr>
          )}

          {error && (
            <tr>
              <td colSpan={4} className="text-center p-6 text-red-600 font-semibold">
                {error}
              </td>
            </tr>
          )}

          {!loading && !error && areas.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-6 text-gray-500">
                No se encontraron Áreas.
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            areas.map((area, index) => (
              <tr key={String(area.id)} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meta?.from != null ? meta.from + index : String(area.id)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {area.name}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {area.institution?.name ?? "Sin institución"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                  {!area.deleted_at ? (
                    <>
                      <button
                        title="Ver"
                        onClick={() => onView(area)}
                        className="bg-white text-[#691b31] p-2 rounded-lg hover:bg-[#9d7e43] hover:text-white transition-colors"
                      >
                        <IconView />
                      </button>

                      <button
                        title="Editar"
                        onClick={() => onEdit(area)}
                        className="bg-white text-[#691b31] p-2 rounded-lg hover:bg-[#1b2469] hover:text-white transition-colors"
                      >
                        <IconEdit />
                      </button>

                      <button
                        title="Desactivar"
                        onClick={() => onBan(area)}
                        className="bg-white text-[#691b31] p-2 rounded-lg hover:bg-[#691b31] hover:text-white transition-colors"
                      >
                        <IconBan />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        title="Ver"
                        onClick={() => onView(area)}
                        className="bg-white text-[#691b31] p-2 rounded-lg hover:bg-[#9d7e43] hover:text-white transition-colors"
                      >
                        <IconView />
                      </button>

                      <button
                        title="Restaurar"
                        onClick={() => onRestore(area)}
                        className="bg-white text-[#691b31] p-2 rounded-lg hover:bg-[#1b6939] hover:text-white transition-colors"
                      >
                        <IconCircleArrowUp />
                      </button>

                      <button
                        title="Eliminar"
                        onClick={() => onDelete(area)}
                        className="bg-white text-[#691b31] p-2 rounded-lg hover:bg-[#691b31] hover:text-white transition-colors"
                      >
                        <IconDelete />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
