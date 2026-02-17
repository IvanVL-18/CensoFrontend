import {
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  type LucideProps,
} from "lucide-react";
import type { CatalogsTableProps } from "../Catalogs.types";

const defaultProps = {
  strokeWidth: 1.75,
  size: 22,
};

const IconSort = (props: LucideProps) => (
  <ArrowUpDown {...defaultProps} {...props} />
);
const IconView = (props: LucideProps) => <Eye {...defaultProps} {...props} />;
const IconEdit = (props: LucideProps) => <Edit {...defaultProps} {...props} />;
const IconDelete = (props: LucideProps) => (
  <Trash2 {...defaultProps} {...props} />
);
const IconCircleArrowUp = (props: LucideProps) => (
  <CircleArrowUp {...defaultProps} {...props} />
);
const IconBan = (props: LucideProps) => <Ban {...defaultProps} {...props} />;

export function CatalogsTable({
  Catalogs,
  meta,
  loading,
  error,
  onSort,
  onView,
  onEdit,
  onBan,
  onRestore,
  onDelete,
}: CatalogsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* 1. Columna "No." */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              <button
                onClick={() => onSort("id")} 
                className="
                  flex items-center space-x-1     
                  text-xs font-medium text-gray-500 uppercase tracking-wider
                  hover:text-opacity-75 transition-colors
                "
              >
                <span>No°</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            {/* 2. Columna "Nombre" */}
            <th className="px-6 py-3 text-left w-full">
              <button
                onClick={() => onSort("name")} 
                className="
                  flex items-center space-x-1     
                  text-xs font-medium text-gray-500 uppercase tracking-wider
                  hover:text-opacity-75 transition-colors
                "
              >
                <span>Nombre</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            {/* 3. Columna "Opciones" */}
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Opciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* --- Estados de Carga y Error --- */}
          {loading && (
            <tr>
              <td colSpan={3} className="text-center p-6 text-gray-500">
                Cargando...
              </td>
            </tr>
          )}

          {error && (
            <tr>
              <td
                colSpan={3}
                className="text-center p-6 text-red-600 font-semibold"
              >
                {error}
              </td>
            </tr>
          )}

          {/* --- Estado Vacío --- */}
          {!loading && !error && Catalogs.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center p-6 text-gray-500">
                No se encontraron catálogos.
              </td>
            </tr>
          )}

          {/* --- Mapeo de datos --- */}
          {!loading &&
            !error &&
            Catalogs.map((Catalog, index) => (
              <tr key={Catalog.id} className="hover:bg-gray-50">
                {/* Celda "No." */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meta ? meta.from + index : Catalog.id}
                </td>

                {/* Celda "Nombre" */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {Catalog.name}
                </td>

                {/* Celda "Opciones" con lógica condicional */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                  {!Catalog.deleted_at ? (
                    <>
                      {/* --- Botón VER (Activo) --- */}
                      <button
                        title="Ver catálogo"
                        onClick={() => onView(Catalog)} 
                        className="
                          bg-white text-[#691b31] 
                          hover:bg-[#9d7e43] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconView />
                      </button>

                      {/* --- Botón EDITAR (Activo) --- */}
                      <button
                        title="Editar catálogo"
                        onClick={() => onEdit(Catalog)} 
                        className="
                          bg-white text-[#691b31] 
                          hover:bg-[#1b2469] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconEdit />
                      </button>

                      {/* --- Botón DESACTIVAR (Ban) --- */}
                      <button
                        title="Desactivar catálogo"
                        onClick={() => onBan(Catalog)} 
                        className="
                          bg-white text-[#691b31] 
                          hover:bg-[#691b31] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconBan />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* --- Botón VER (Inactivo) --- */}
                      <button
                        title="Ver catálogo"
                        onClick={() => onView(Catalog)} 
                        className="
                           bg-white text-[#691b31] 
                          hover:bg-[#9d7e43] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconView />
                      </button>

                      {/* --- Botón RESTAURAR (ArrowUp) --- */}
                      <button
                        title="Restaurar categoría"
                        onClick={() => onRestore(Catalog)} 
                        className="
                           bg-white text-[#691b31] 
                          hover:bg-[#1b6939] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconCircleArrowUp />
                      </button>

                      {/* --- Botón ELIMINAR PERMANENTE (Delete) --- */}
                      <button
                        title="Eliminar Permanentemente"
                        onClick={() => onDelete(Catalog)} 
                        className="
                           bg-white text-[#691b31] 
                          hover:bg-[#691b31] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
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
