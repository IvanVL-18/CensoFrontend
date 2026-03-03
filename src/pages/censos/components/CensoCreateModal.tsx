import { useRef } from "react";
import { X, FileText, Upload } from "lucide-react";
import { CensoManualForm } from "./CensoManualForm";
import type { CensoManualFormRef } from "./CensoManualForm";
import { CensoUploadArea } from "./CensoUploadArea";
import type { CensoUploadAreaRef } from "./CensoUploadArea";
import type { Censo } from "../Censos.types";

interface CensoCreateModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: any) => void;
  onBulkUpload: (file: File) => void;
  mode: "create" | "upload";
  editingCenso?: Censo | null;
  formRef?: React.RefObject<CensoManualFormRef>;
  onFormValidityChange?: (isValid: boolean) => void;
  isFormValid?: boolean;
}

export function CensoCreateModal({
  isOpen,
  isSubmitting,
  error,
  onClose,
  onSave,
  onBulkUpload,
  mode,
  editingCenso,
  formRef,
  onFormValidityChange,
  isFormValid,
}: CensoCreateModalProps) {
  const internalManualFormRef = useRef<CensoManualFormRef>(null);
  const uploadAreaRef = useRef<CensoUploadAreaRef>(null);

  const manualFormRef = formRef || internalManualFormRef;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    // Extrae YYYY-MM-DD de cualquier formato ISO o con hora
    return dateStr.split('T')[0].split(' ')[0];
  };

  const initialData = editingCenso
    ? {
        name: editingCenso.name,
        description: editingCenso.description,
        init_date: formatDate(editingCenso.start_date),
        deadline: formatDate(editingCenso.end_date),
      }
    : undefined;

  const resetState = () => {
    manualFormRef.current?.reset();
    uploadAreaRef.current?.reset();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const title =
    mode === "create"
      ? editingCenso
        ? "Editar censo"
        : "Crear censo manual"
      : "Subir censo por plantilla";

  // Clave única: incluye id y una representación de las fechas para forzar remonte incluso si el id no cambia pero los datos sí
  const formKey = editingCenso 
    ? `edit-${editingCenso.id}-${editingCenso.start_date}-${editingCenso.end_date}`
    : 'create';

  return (
    <>
      <div
        className="fixed inset-0 bg-[#000000ab] z-40 transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {mode === "create" ? (
              <CensoManualForm
                key={formKey}
                ref={manualFormRef}
                isSubmitting={isSubmitting}
                onSubmit={onSave}
                error={error}
                initialData={initialData}
                onFullValidityChange={onFormValidityChange}
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
                disabled={isSubmitting || !isFormValid}
                className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  "Procesando..."
                ) : (
                  <>
                    <FileText size={18} />
                    {editingCenso ? "Actualizar Censo" : "Crear Censo"}
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
                {isSubmitting ? (
                  "Procesando..."
                ) : (
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