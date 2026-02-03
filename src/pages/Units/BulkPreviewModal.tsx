import { CheckCircle, X } from "lucide-react";

interface BulkPreviewModalProps {
  isOpen: boolean;
  data: any[];
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function BulkPreviewModal({ isOpen, data, onClose, onConfirm, isSubmitting }: BulkPreviewModalProps) {
  if (!isOpen || data.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-[#00000080] z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-5 bg-green-700 text-white">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} />
            <h2 className="text-lg font-bold">Previsualización de Importación ({data.length} registros)</h2>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-grow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Nombre / Dato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.name || JSON.stringify(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-semibold">Cancelar</button>
          <button 
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800 disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Confirmar e Importar"}
          </button>
        </div>
      </div>
    </div>
  );
}