import {
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  MapPin, 
  type LucideProps,
} from "lucide-react";
import type { InstitutionTableProps } from "../institutions.types"; 
import Loading from "../../../components/Loading";



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
}: InstitutionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              <button
                onClick={() => onSort("id")} 
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-opacity-75 transition-colors"
              >
                <span>No°</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              <button
                onClick={() => onSort("name")} 
                className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-opacity-75 transition-colors"
              >
                <span>Nombre</span>
                <IconSort size={16} strokeWidth={2.5} />
              </button>
            </th>

            
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Ubicación
            </th>

            
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
              Opciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          
          {loading && (
            <tr>
              <td colSpan={5} className="text-center p-6 text-gray-500">
                <Loading />
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

          
          {!loading && !error && institutions.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-6 text-gray-500">
                No se encontraron Instituciones.
              </td>
            </tr>
          )}

      
          {!loading &&
            !error &&
            institutions.map((institution, index) => (
              <tr key={institution.id} className="hover:bg-gray-50">
           
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meta ? meta.from + index : institution.id}
                </td>

           
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {institution.name}
                </td>

              
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <button
                    title="Ver en Mapa"
                    onClick={() => onShowMap(institution)}
                    className="bg-white text-[#691b31] hover:bg-sky-700 hover:text-white active:bg-sky-900 active:text-white p-2 rounded-lg leading-none transition-colors"
                  >
                    <IconMap />
                  </button>
                </td>

              
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                  {!institution.deleted_at ? (
                    <>
                    
                      <button
                        title="Ver Institución"
                        onClick={() => onView(institution)} 
                        className="bg-white text-[#691b31] hover:bg-[#9d7e43] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconView />
                      </button>

                      
                      <button
                        title="Editar Institución"
                        onClick={() => onEdit(institution)} 
                        className="bg-white text-[#691b31] hover:bg-[#1b2469] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconEdit />
                      </button>

                   
                      <button
                        title="Desactivar Institución"
                        onClick={() => onBan(institution)} 
                        className="bg-white text-[#691b31] hover:bg-[#691b31] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconBan />
                      </button>
                    </>
                  ) : (
                    <>
              
                      <button
                        title="Ver Institución"
                        onClick={() => onView(institution)} 
                        className="bg-white text-[#691b31] hover:bg-[#9d7e43] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconView />
                      </button>

                     
                      <button
                        title="Restaurar Institución"
                        onClick={() => onRestore(institution)} 
                        className="bg-white text-[#691b31] hover:bg-[#1b6939] hover:text-white active:bg-[#691b31] active:text-white p-2 rounded-lg leading-none transition-colors"
                      >
                        <IconCircleArrowUp />
                      </button>

 
                      <button
                        title="Eliminar Permanentemente"
                        onClick={() => onDelete(institution)} 
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
