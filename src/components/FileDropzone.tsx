import { useId, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Upload } from "lucide-react";

interface FileDropzoneProps {
  /** Extensiones aceptadas, con punto: [".xlsx", ".xlsm"]. */
  accept: string[];
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  title: ReactNode;
  hint?: ReactNode;
  buttonLabel?: string;
}

/**
 * Zona para arrastrar archivos o elegirlos con el botón. No valida: entrega los
 * archivos tal cual y quien la usa decide qué aceptar.
 */
export default function FileDropzone({
  accept,
  multiple = false,
  disabled = false,
  onFiles,
  title,
  hint,
  buttonLabel = multiple ? "Elegir archivos" : "Elegir archivo",
}: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const deliver = (list: FileList | null) => {
    if (!list || list.length === 0 || disabled) return;
    const files = Array.from(list);
    onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition",
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
          : dragOver
            ? "border-[var(--pantone-7421)] bg-[#F7F3E8]"
            : "border-gray-300 bg-gray-50",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        deliver(e.dataTransfer.files);
      }}
    >
      <Upload size={28} className="mb-2 text-[var(--pantone-7421)]" aria-hidden="true" />
      <p className="font-medium text-gray-800">{title}</p>
      {hint && <p className="mt-1 max-w-xl text-sm text-gray-500">{hint}</p>}

      {/* El input queda dentro de la etiqueta: con teclado, el foco se ve en el botón. */}
      <label
        htmlFor={inputId}
        className={clsx(
          "mt-4 rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white",
          "focus-within:ring-2 focus-within:ring-[var(--pantone-7421)] focus-within:ring-offset-2",
          disabled ? "pointer-events-none" : "cursor-pointer hover:opacity-90",
        )}
      >
        {buttonLabel}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept.join(",")}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            deliver(e.target.files);
            // Permite volver a elegir el mismo archivo.
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </label>
    </div>
  );
}
