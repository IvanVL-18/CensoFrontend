import { X, UploadCloud, PenSquare } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpload: () => void;
  onCreate: () => void;
};

export default function NewCensusModal({
  open,
  onClose,
  onUpload,
  onCreate,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--pantone-7421)] text-white px-5 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Nuevo censo</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600 text-center">
            Elige cómo deseas empezar un nuevo censo.
          </p>

          <div className="flex gap-4">
            {/* Subir */}
            <button
              type="button"
              onClick={onUpload}
              className="w-32 h-32 border border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-[13px] text-[var(--pantone-7421)] hover:bg-gray-50 hover:border-[var(--pantone-7421)]/70 transition-colors"
            >
              <UploadCloud className="w-7 h-7" />
              <span>Subir</span>
            </button>

            {/* Crear */}
            <button
              type="button"
              onClick={onCreate}
              className="w-32 h-32 border border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-[13px] text-[var(--pantone-7421)] hover:bg-gray-50 hover:border-[var(--pantone-7421)]/70 transition-colors"
            >
              <PenSquare className="w-7 h-7" />
              <span>Crear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
