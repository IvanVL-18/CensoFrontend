import { useState, useEffect } from "react";
import UiModal from "./UiModal"; // Tu UiModal.tsx modificado

type Payload = {
  name: string;
  year: number | "";
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

// 🍷 Paleta de colores: Vino tinto y Taupe/Marrón Cálido
const PRIMARY_COLOR_VINO = "#691B31"; // Vino tinto (El color de tu barra original)
const FOCUS_RING_COLOR = "focus:ring-red-800"; // Rojo oscuro/Vino para el anillo de enfoque
const BUTTON_VINO_CLASSES = `bg-[${PRIMARY_COLOR_VINO}] hover:bg-[#521526]`; // Clases del botón Vino

export default function NewCensoModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: Omit<Payload, "year"> & { year: number }) => void;
}) {
  const [form, setForm] = useState<Payload>({
    name: "",
    year: "",
    description: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        year: new Date().getFullYear(),
        description: "",
        startDate: "",
        endDate: "",
        active: true,
      });
    }
  }, [open]);

  // Validación (manteniéndola igual)
  const valid =
    form.name.trim().length >= 3 &&
    typeof form.year === "number" &&
    String(form.year).length === 4 &&
    !!form.startDate &&
    !!form.endDate;

  const save = () => {
    if (!valid) return;
    onCreate({
      name: form.name.trim(),
      year: form.year as number,
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      active: form.active,
    });
    onClose();
  };

  // ☕ Estilo base para inputs: color de enfoque Vino y borde cálido (taupe/gray-300)
  const inputBase = `h-11 w-full rounded-md border border-gray-300 bg-white px-4 text-base text-gray-800 shadow-sm focus:outline-none focus:border-[${PRIMARY_COLOR_VINO}] focus:ring-1 ${FOCUS_RING_COLOR} transition-all duration-200 placeholder-gray-400`;

  // Etiqueta para mantener el tono cálido
  const labelBase = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <UiModal
      open={open}
      onClose={onClose}
      title="Crea un Nuevo Censo" // Título ligeramente modificado
      hideCloseButton={true} 
      maxWidth="max-w-md" 
      footer={
        <div className="flex justify-end gap-3 w-full"> 
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 shadow-sm hover:bg-gray-200 transition duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={!valid}
            // Botón de guardar en color Vino tinto
            className={`px-6 py-2 rounded-md text-sm font-semibold text-white shadow-md ${BUTTON_VINO_CLASSES} disabled:opacity-50 transition duration-200`}
            style={{ boxShadow: `0 4px 6px -1px rgba(105, 27, 49, 0.3), 0 2px 4px -2px rgba(105, 27, 49, 0.3)` }} // Sombra del color Vino
          >
            Guardar Censo
          </button>
        </div>
      }
    >
      <div className="space-y-6"> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Nombre del Censo */}
            <div>
              <label className={labelBase}>Nombre del Censo</label>
              <input
                className={inputBase}
                placeholder="Ej: Censo Poblacional 2024"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            {/* Año */}
            <div>
              <label className={labelBase}>Año</label>
              <input
                className={inputBase}
                placeholder="20XX"
                inputMode="numeric"
                maxLength={4}
                value={form.year}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setForm((f) => ({ ...f, year: v ? Number(v) : "" }));
                }}
              />
            </div>
            {/* Fecha de inicio */}
            <div>
              <label className={labelBase}>Fecha de inicio</label>
              <input
                type="date"
                className={inputBase}
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            {/* Fecha de finalización */}
            <div>
              <label className={labelBase}>Fecha de finalización</label>
              <input
                type="date"
                className={inputBase}
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
        </div>

        {/* Descripción */}
        <div>
          <label className={labelBase}>Descripción (Opcional)</label>
          <textarea
            rows={4} 
            className={`w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base shadow-sm focus:outline-none focus:border-[${PRIMARY_COLOR_VINO}] focus:ring-1 ${FOCUS_RING_COLOR} placeholder-gray-400`}
            placeholder="Breve descripción del censo, objetivos y metodología..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        
        {/* Activo (Toggle Vino) */}
        <div className="flex items-center justify-between pt-2">
          <label htmlFor="active-toggle" className="text-base font-medium text-gray-800">
            Censo Activo
          </label>
          
          <button
            id="active-toggle"
            type="button"
            onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
              form.active ? `bg-[${PRIMARY_COLOR_VINO}]` : "bg-gray-400"
            }`}
            aria-pressed={form.active}
            aria-label="Cambiar estado activo"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
                form.active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </UiModal>
  );
}