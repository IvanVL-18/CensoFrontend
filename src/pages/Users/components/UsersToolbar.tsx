import { useRef, type ChangeEvent } from "react";
import { CirclePlus, FileDown } from "lucide-react";
import AddButton from "../../../components/AddButton";

interface UsersToolbarProps {
  isSubmitting: boolean;
  onAddClick: () => void;
  onBulkUpload: (file: File) => void;
}

export function UsersToolbar({
  isSubmitting,
  onAddClick,
  onBulkUpload,
}: UsersToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onBulkUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">Usuarios</h1>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <AddButton
            label={isSubmitting ? "Cargando..." : "Carga Masiva"}
            onClick={() => fileInputRef.current?.click()}
            variant="green"
            disabled={isSubmitting}
            icon={<FileDown size={22} strokeWidth={2.5} />}
          />

          <AddButton
            label="Agregar Usuario"
            onClick={onAddClick}
            variant="gold"
            icon={<CirclePlus size={22} strokeWidth={2.5} />}
          />
        </div>
      </div>
    </>
  );
}
