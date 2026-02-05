import {
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  type LucideProps,
} from "lucide-react";
import type { Index, Meta } from "./indexs.interfaces"; 



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


interface IndexsTableProps {
  indexs: Index[]; 
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Index) => void;
  onView: (index: Index) => void;
  onEdit: (index: Index) => void;
  onBan: (index: Index) => void;
  onRestore: (index: Index) => void;
  onDelete: (index: Index) => void;
}

export function IndexsTable({
  indexs,
  meta,
  loading,
  error,
  onSort,
  onView,
  onEdit,
  onBan,
  onRestore,
  onDelete,
}: IndexsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
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

            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Opciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
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

          {!loading && !error && indexs.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center p-6 text-gray-500">
                No se encontraron Indices.
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            indexs.map((indexData, i) => (
              <tr key={indexData.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meta ? meta.from + i : indexData.id}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {indexData.name}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                  {!indexData.deleted_at ? (
                    <>
                      <button
                        title="Ver Indice"
                        onClick={() => onView(indexData)} 
                        className="
                          bg-white text-[#691b31] 
                          hover:bg-[#9d7e43] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconView />
                      </button>

                      <button
                        title="Editar Indice"
                        onClick={() => onEdit(indexData)} 
                        className="
                          bg-white text-[#691b31] 
                          hover:bg-[#1b2469] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconEdit />
                      </button>

                      <button
                        title="Desactivar Indice"
                        onClick={() => onBan(indexData)} 
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
                      <button
                        title="Ver Indice"
                        onClick={() => onView(indexData)} 
                        className="
                           bg-white text-[#691b31] 
                          hover:bg-[#9d7e43] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconView />
                      </button>

                      <button
                        title="Restaurar Indice"
                        onClick={() => onRestore(indexData)} 
                        className="
                           bg-white text-[#691b31] 
                          hover:bg-[#1b6939] hover:text-white 
                          active:bg-[#691b31] active:text-white
                          p-2 rounded-lg leading-none transition-colors
                        "
                      >
                        <IconCircleArrowUp />
                      </button>

                      <button
                        title="Eliminar Permanentemente"
                        onClick={() => onDelete(indexData)} 
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