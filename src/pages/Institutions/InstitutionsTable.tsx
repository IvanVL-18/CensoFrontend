import {
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  MapPin, // <-- Importamos el nuevo ícono
  type LucideProps,
} from "lucide-react";
import type { Institution, Meta } from "./Institutions.interfaces"; // Asegúrate que la ruta sea correcta

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
const IconMap = (props: LucideProps) => <MapPin {...defaultProps} {...props} />;
const IconBan = (props: LucideProps) => (
  <Ban {...defaultProps} {...props} />
);

// --- Definición de Props ---

interface InstitutionsTableProps {
  institutions: Institution[]; // Recibe las instituciones YA filtradas y ordenadas
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Institution) => void;
  // Funciones para manejar las acciones
  onShowMap: (institution: Institution) => void; // <-- Nueva prop para el mapa
  onView: (institution: Institution) => void;
  onEdit: (institution: Institution) => void;
  onBan: (institution: Institution) => void;
  onRestore: (institution: Institution) => void;
  onDelete: (institution: Institution) => void;
}

// --- Componente ---

export function InstitutionsTable({
  institutions,
  meta,
  loading,
  error,
  onSort,
  onShowMap,
  onView,
  onEdit,
  onBan,
  onRestore,
  onDelete,
}: InstitutionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* 1. Columna "No." */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              <button
                onClick={() => onSort("id")} // Conectado a la prop onSort
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-opacity-75 transition-colors"
              >
                <span>No°</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            {/* 2. Columna "Nombre" */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              <button
                onClick={() => onSort("name")} // Conectado a la prop onSort
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-opacity-75 transition-colors"
              >
                <span>Nombre</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            {/* 4. Columna "Geocódigo" */}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Ubicación
            </th>

            {/* 6. Columna "Opciones" */}
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
              Opciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* --- Estados de Carga y Error --- */}
          {loading && (
            <tr>
              <td colSpan={5} className="text-center p-6 text-gray-500">
                Cargando...
              </td>
            </tr>
          )}

          {error && (
            <tr>
              <td
                colSpan={5}
                className="text-center p-6 text-red-600 font-semibold"
              >
                {error}
              </td>
            </tr>
          )}

          {/* --- Estado Vacío --- */}
          {!loading && !error && institutions.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-6 text-gray-500">
                No se encontraron Instituciones.
              </td>
            </tr>
          )}

          {/* --- Mapeo de datos --- */}
          {!loading &&
            !error &&
            institutions.map((institution, index) => (
              <tr key={institution.id} className="hover:bg-gray-50">
                {/* Celda "No." */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meta ? meta.from + index : institution.id}
                </td>

                {/* Celda "Nombre" */}
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {institution.name}
                </td>

                {/* Celda "Geocódigo" */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <button
                    title="Ver en Mapa"
                    onClick={() => onShowMap(institution)}
                    className="bg-white text-[#691b31] hover:bg-sky-700 hover:text-white active:bg-sky-900 active:text-white p-2 rounded-lg leading-none transition-colors"
                  >
                    <IconMap />
                  </button>
                </td>

                {/* Celda "Opciones" con lógica condicional */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                  {!institution.deleted_at ? (
                    <>
                      {/* --- Botón VER (Activo) --- */}
                      <button
                        title="Ver Institución"
                        onClick={() => onView(institution)} // Conectado a prop
                        className="bg-white text-[#691b31] hover:bg-[#9d7e43] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconView />
                      </button>

                      {/* --- Botón EDITAR (Activo) --- */}
                      <button
                        title="Editar Institución"
                        onClick={() => onEdit(institution)} // Conectado a prop
                        className="bg-white text-[#691b31] hover:bg-[#1b2469] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconEdit />
                      </button>

                      {/* --- Botón DESACTIVAR (Ban) --- */}
                      <button
                        title="Desactivar Institución"
                        onClick={() => onBan(institution)} // Conectado a prop
                        className="bg-white text-[#691b31] hover:bg-[#691b31] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconBan />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* --- Botón VER (Inactivo) --- */}
                      <button
                        title="Ver Institución"
                        onClick={() => onView(institution)} // Conectado a prop
                        className="bg-white text-[#691b31] hover:bg-[#9d7e43] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconView />
                      </button>

                      {/* --- Botón RESTAURAR (ArrowUp) --- */}
                      <button
                        title="Restaurar Institución"
                        onClick={() => onRestore(institution)} // Conectado a prop
                        className="bg-white text-[#691b31] hover:bg-[#1b6939] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconCircleArrowUp />
                      </button>

                      {/* --- Botón ELIMINAR PERMANENTE (Delete) --- */}
                      <button
                        title="Eliminar Permanentemente"
                        onClick={() => onDelete(institution)} // Conectado a prop
                        className="bg-white text-[#691b31] hover:bg-[#691b31] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
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
