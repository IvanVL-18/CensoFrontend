import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Upload, FileText } from "lucide-react";
import { FormErrors } from "./FormErrors";

interface CensoUploadDependencyProps {
  isSubmitting: boolean;
  onFileSubmit: (file: File) => void;
  error?: string | null;
}

export interface CensoUploadDependencyRef {
  reset: () => void;
  submit: () => boolean; 
}

export const CensoUploadDependency = forwardRef<CensoUploadDependencyRef, CensoUploadDependencyProps>(
  ({ isSubmitting, onFileSubmit, error }, ref) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadErrors, setUploadErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setSelectedFile(null);
        setUploadErrors([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      submit: () => {
        if (selectedFile) {
          onFileSubmit(selectedFile);
          return true;
        } else {
          setUploadErrors(["Por favor selecciona un archivo Excel para subir"]);
          return false;
        }
      },
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const validTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv' 
        ];
        
        if (!validTypes.includes(file.type)) {
          setUploadErrors(["Por favor selecciona un archivo Excel válido (.xlsx, .xls, .csv)"]);
          setSelectedFile(null);
          return;
        }
        
        setSelectedFile(file);
        setUploadErrors([]);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const validTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'
        ];
        
        if (!validTypes.includes(file.type)) {
          setUploadErrors(["Por favor selecciona un archivo Excel válido (.xlsx, .xls, .csv)"]);
          setSelectedFile(null);
          return;
        }
        
        setSelectedFile(file);
        setUploadErrors([]);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    };

    return (
      <div className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            selectedFile
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-[#691b31] hover:bg-gray-50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
            disabled={isSubmitting}
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <FileText className="mx-auto text-green-600" size={48} />
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={isSubmitting}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Quitar archivo
              </button>
            </div>
          ) : (
            <div
              className={`cursor-pointer ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (!isSubmitting) fileInputRef.current?.click();
              }}
            >
              <Upload className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-600 mb-1">
                Arrastra un archivo o <span className="text-[#691b31] font-medium">selecciona</span>
              </p>
              <p className="text-sm text-gray-500">
                Formatos aceptados: .xlsx, .xls, .csv
              </p>
            </div>
          )}
        </div>

        {/* Vista previa de fechas del diseño */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Formato esperado:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Inicio:</span>
              <span className="ml-2 font-mono">2024-07-21</span>
            </div>
            <div>
              <span className="text-gray-500">Fin:</span>
              <span className="ml-2 font-mono">2024-07-21</span>
            </div>
          </div>
        </div>

        {uploadErrors.length > 0 && <FormErrors errors={uploadErrors} />}
        {error && <FormErrors errors={[error]} />}
      </div>
    );
  }
);

CensoUploadDependency.displayName = "CensoUploadDependency";
