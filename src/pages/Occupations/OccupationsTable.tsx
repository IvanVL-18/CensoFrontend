import {
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  type LucideProps,
} from "lucide-react";
import type { Occupation, Meta } from "./Occupations.interfaces"; // Asegúrate que la ruta sea correcta

// --- Definiciones de Iconos (usados solo en la tabla) ---

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
const IconBan = (props: LucideProps) => (
  <Ban {...defaultProps} {...props} />
);

// --- Definición de Props ---

interface OccupationsTableProps {
  occupation: Occupation[]; // Recibe las ocupaciones YA filtradas y ordenadas
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Occupation) => void;
  // Funciones para manejar las acciones
  onView: (occupation: Occupation) => void;
  onEdit: (occupation: Occupation) => void;
  onBan: (occupation: Occupation) => void;
  onRestore: (occupation: Occupation) => void;
  onDelete: (occupation: Occupation) => void;
}

// --- Componente ---

export function OccupationsTable({
  occupation: occupations,
  meta,
  loading,
  error,
  onSort,
  onView,
  onEdit,
  onBan,
  onRestore,
  onDelete,
}: OccupationsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* 1. Columna "No." */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              <button
                onClick={() => onSort("id")} // Conectado a la prop onSort
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
                onClick={() => onSort("name")} // Conectado a la prop onSort
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
          {!loading && !error && occupations.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center p-6 text-gray-500">
                No se encontraron Ocupaciones.
              </td>
            </tr>
          )}

          {/* --- Mapeo de datos --- */}
          {!loading &&
            !error &&
            occupations.map((occupation, index) => (
              <tr key={occupation.id} className="hover:bg-gray-50">
                {/* Celda "No." */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meta ? meta.from + index : occupation.id}
                </td>

                {/* Celda "Nombre" */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {occupation.name}
                </td>

                {/* Celda "Opciones" con lógica condicional */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                  {!occupation.deleted_at ? (
                    <>
                      {/* --- Botón VER (Activo) --- */}
                      <button
                        title="Ver Ocupación"
                        onClick={() => onView(occupation)} // Conectado a prop
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
                        title="Editar Ocupación"
                        onClick={() => onEdit(occupation)} // Conectado a prop
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
                        title="Desactivar Ocupación"
                        onClick={() => onBan(occupation)} // Conectado a prop
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
                        title="Ver Ocupación"
                        onClick={() => onView(occupation)} // Conectado a prop
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
                        title="Restaurar Ocupación"
                        onClick={() => onRestore(occupation)} // Conectado a prop
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
                        onClick={() => onDelete(occupation)} // Conectado a prop
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