import { X, AlertCircle } from "lucide-react";
import type { BulkErrorModalProps } from "../Questions.types";

// DICCIONARIO DE TRADUCCIÓN
// Claves: Deben coincidir con los "slugs" que Laravel Excel genera desde tus encabezados.
// Valores: Texto bonito para el usuario.
const FIELD_LABELS: Record<string, string> = {
  // Mapeo exacto de 'QuestionsImport.php' -> $expectedHeaders
  titulo_de_la_pregunta: "Título de la Pregunta",
  instrucciones_de_la_pregunta: "Instrucciones",
  comentarios_de_la_pregunta: "Comentarios (Si/No)",
  estructura_de_la_pregunta: "Estructura (JSON)",
  
  // Mapeos extra por si acaso el validador usa el nombre de la BD
  name: "Título de la Pregunta",
  instructions: "Instrucciones",
  commentaries: "Comentarios",
  question_structure: "Estructura",
};

export function BulkErrorModal({
  isOpen,
  errors,
  onClose,
}: BulkErrorModalProps) {
  if (!isOpen || errors.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-[#00000080] z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-5 bg-[#691b31] text-white">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-[#9d7e43]" />
            <div>
              <h2 className="text-lg font-bold leading-none">
                Errores en el archivo Excel
              </h2>
              <p className="text-xs text-gray-300 mt-1">
                Corrige las siguientes filas y vuelve a subir el archivo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo con Tabla */}
        <div className="overflow-y-auto flex-grow p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Fila
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Columna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Valor Recibido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalle del Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {errors.map((err, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Fila */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#691b31] font-bold">
                    #{err.row}
                  </td>

                  {/* Campo (Usando el diccionario) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs uppercase border border-gray-200">
                      {FIELD_LABELS[err.field] || err.field}
                    </span>
                  </td>

                  {/* Valor Inválido */}
                  <td className="px-6 py-4 text-sm text-red-600 italic">
                    <div
                      className="max-w-[200px] truncate"
                      title={String(err.invalid_value)}
                    >
                      {err.invalid_value ? `"${err.invalid_value}"` : "(Vacío)"}
                    </div>
                  </td>

                  {/* Lista de Mensajes */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col gap-1">
                      {err.errors.map((msg, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100"
                        >
                          • {msg}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="
              bg-[#691b31] text-white 
              hover:bg-[#4d1324] 
              active:scale-95
              px-6 py-2 rounded-lg 
              font-bold text-sm
              transition-all shadow-sm
            "
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}