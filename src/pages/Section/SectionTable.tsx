import {
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  type LucideProps,
} from "lucide-react";
import type { Section, Meta } from "./Section.interfaces";

// --- Definiciones de Iconos ---
const defaultProps = {
  strokeWidth: 1.75,
  size: 22,
};

const IconSort = (props: LucideProps) => <ArrowUpDown {...defaultProps} {...props} />;
const IconView = (props: LucideProps) => <Eye {...defaultProps} {...props} />;
const IconEdit = (props: LucideProps) => <Edit {...defaultProps} {...props} />;
const IconDelete = (props: LucideProps) => <Trash2 {...defaultProps} {...props} />;
const IconCircleArrowUp = (props: LucideProps) => <CircleArrowUp {...defaultProps} {...props} />;
const IconBan = (props: LucideProps) => <Ban {...defaultProps} {...props} />;

// --- Definición de Props ---
interface SectionsTableProps {
  Sections: Section[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Section) => void;
  onView: (Section: Section) => void;
  onEdit: (Section: Section) => void;
  onBan: (Section: Section) => void;
  onRestore: (Section: Section) => void;
  onDelete: (Section: Section) => void;
}

// ... (Iconos e interfaces se mantienen igual)

export function SectionsTable({
  Sections,
  meta,
  loading,
  error,
  onSort,
  onView,
  onEdit,
  onBan,
  onRestore,
  onDelete,
}: SectionsTableProps) {
  return (
    <div className="overflow-x-auto">
      {/* Añadimos table-fixed para que la tabla respete los anchos de columna definidos */}
      <table className="min-w-full divide-y divide-gray-200 table-fixed"> 
        <thead className="bg-gray-50">
          <tr>
            {/* 1. Columna "No." - Ancho pequeño fijo */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              <button
                onClick={() => onSort("id")}
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-opacity-75 transition-colors"
              >
                <span>No°</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            {/* 2. Columna "Nombre" - Eliminamos w-full y damos un ancho base */}
            <th className="px-6 py-3 text-left w-auto">
              <button
                onClick={() => onSort("name")}
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-opacity-75 transition-colors"
              >
                <span>Nombre</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            {/* 3. Columna "Opciones" - Ancho fijo para que no baile */}
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
              Opciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">

          {!loading &&
            !error &&
            Sections.map((Section, index) => (
              <tr key={Section.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meta ? meta.from + index : Section.id}
                </td>

                <td 
                  className="px-6 py-4 text-sm font-medium text-gray-900"
                  title={Section.name} 
                >
                  <div className="truncate max-w-[300px] lg:max-w-[500px]">
                    {Section.name}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                  {!Section.deleted_at ? (
                    <>
                      <button
                        title="Ver Sección"
                        onClick={() => onView(Section)}
                        className="bg-white text-[#691b31] hover:bg-[#9d7e43] hover:text-white p-2 rounded-lg transition-colors"
                      >
                        <IconView />
                      </button>
                      <button
                        title="Editar Sección"
                        onClick={() => onEdit(Section)}
                        className="bg-white text-[#691b31] hover:bg-[#1b2469] hover:text-white p-2 rounded-lg transition-colors"
                      >
                        <IconEdit />
                      </button>
                      <button
                        title="Desactivar Sección"
                        onClick={() => onBan(Section)}
                        className="bg-white text-[#691b31] hover:bg-[#691b31] hover:text-white p-2 rounded-lg transition-colors"
                      >
                        <IconBan />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        title="Ver Sección"
                        onClick={() => onView(Section)}
                        className="bg-white text-[#691b31] hover:bg-[#9d7e43] hover:text-white p-2 rounded-lg transition-colors"
                      >
                        <IconView />
                      </button>
                      <button
                        title="Restaurar Sección"
                        onClick={() => onRestore(Section)}
                        className="bg-white text-[#691b31] hover:bg-[#1b6939] hover:text-white p-2 rounded-lg transition-colors"
                      >
                        <IconCircleArrowUp />
                      </button>
                      <button
                        title="Eliminar Permanente"
                        onClick={() => onDelete(Section)}
                        className="bg-white text-[#691b31] hover:bg-[#691b31] hover:text-white p-2 rounded-lg transition-colors"
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