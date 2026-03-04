import { useRef, useMemo, type Dispatch, type SetStateAction } from "react";
import { X, FileText, Upload } from "lucide-react";
import { CensoManualForm } from "./CensoManualForm";
import type { CensoManualFormRef } from "./CensoManualForm";
import { CensoUploadDependency } from "./CensoUploadDependencies";
import type { CensoUploadDependencyRef } from "./CensoUploadDependencies";
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
  onFormValidityChange: Dispatch<SetStateAction<boolean>>;
  isFormValid: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  isDirty?: boolean;
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
  onFormValidityChange,
  isFormValid,
  onDirtyChange,
  isDirty,
}: CensoCreateModalProps) {
  const manualFormRef = useRef<CensoManualFormRef>(null);
  const uploadDependencyRef = useRef<CensoUploadDependencyRef>(null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return undefined;
    return dateStr.split('T')[0].split(' ')[0];
  };

  const initialData = useMemo(() => {
    if (!editingCenso) return undefined;
    return {
      name: editingCenso.name,
      description: editingCenso.description,
      init_date: formatDate(editingCenso.start_date),
      deadline: formatDate(editingCenso.end_date),
    };
  }, [editingCenso]);

  const resetState = () => {
    manualFormRef.current?.reset();
    uploadDependencyRef.current?.reset();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFormValidityChange = (isValid: boolean) => {
    onFormValidityChange(isValid);
  };

  if (!isOpen) return null;

  const title =
    mode === "create"
      ? editingCenso
        ? "Editar censo"
        : "Crear censo manual"
      : "Subir censo por plantilla";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
                ref={manualFormRef}
                isSubmitting={isSubmitting}
                onSubmit={onSave}
                error={error}
                initialData={initialData}
                onFullValidityChange={handleFormValidityChange}
                onDirtyChange={onDirtyChange}
              />
            ) : (
              <CensoUploadDependency
                ref={uploadDependencyRef}
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
                disabled={isSubmitting || !isFormValid || (!!editingCenso && !isDirty)}
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
                onClick={() => uploadDependencyRef.current?.submit()}
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