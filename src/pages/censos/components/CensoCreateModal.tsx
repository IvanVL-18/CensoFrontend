import { useRef } from "react";
import { X, FileText, Upload } from "lucide-react";
import { CensoManualForm } from "./CensoManualForm";
import type { CensoManualFormRef } from "./CensoManualForm";
import { CensoUploadArea } from "./CensoUploadArea";
import type { CensoUploadAreaRef } from "./CensoUploadArea";

interface CensoCreateModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; init_date?: string; deadline?: string }) => void;
  onBulkUpload: (file: File) => void;
  mode: "create" | "upload";
}

export function CensoCreateModal({
  isOpen,
  isSubmitting,
  error,
  onClose,
  onSave,
  onBulkUpload,
  mode,
}: CensoCreateModalProps) {
  const manualFormRef = useRef<CensoManualFormRef>(null);
  const uploadAreaRef = useRef<CensoUploadAreaRef>(null);

  const resetState = () => {
    manualFormRef.current?.reset();
    uploadAreaRef.current?.reset();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const title = mode === "create" ? "Crear censo manual" : "Subir censo por plantilla";

  return (
    <>
      <div
        className="fixed inset-0 bg-[#000000ab] z-40 transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-[#691b31]">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {mode === "create" ? (
              <CensoManualForm
                ref={manualFormRef}
                isSubmitting={isSubmitting}
                onSubmit={onSave}
                error={error}
              />
            ) : (
              <CensoUploadArea
                ref={uploadAreaRef}
                isSubmitting={isSubmitting}
                onFileSubmit={onBulkUpload}
                error={error}
              />
            )}
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            {mode === "create" ? (
              <button
                type="button"
                onClick={() => manualFormRef.current?.submit()}
                disabled={isSubmitting}
                className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? "Procesando..." : (
                  <>
                    <FileText size={18} />
                    Crear Censo
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => uploadAreaRef.current?.submit()}
                disabled={isSubmitting}
                className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? "Procesando..." : (
                  <>
                    <Upload size={18} />
                    Subir Archivo
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}