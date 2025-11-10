import { useState, useEffect } from "react";
import UiModal from "./UiModal";

type Payload = {
  name: string;
  year: number | "";
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

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
      setForm({ name: "", year: new Date().getFullYear(), description: "", startDate: "", endDate: "", active: true });
    }
  }, [open]);

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

  const inputBase =
    "h-10 w-full rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-[#506C7F] text-sm";

  return (
    <UiModal
      open={open}
      onClose={onClose}
      title="Agregar Nuevo Censo"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={!valid}
            className="px-4 h-9 rounded-md text-white disabled:opacity-50 bg-gradient-to-r from-[#506C7F] to-[#3E4C59] shadow-md hover:brightness-95"
          >
            Aceptar
          </button>
        </>
      }
    >
      {/* Subtítulo sección */}
      <div className="text-center text-gray-800 font-semibold mb-4">
        Información del Cuestionario
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 gap-4">
        {/* Nombre + Año */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              className={inputBase}
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              className={inputBase}
              placeholder="Año"
              inputMode="numeric"
              maxLength={4}
              value={form.year}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setForm((f) => ({ ...f, year: v ? Number(v) : "" }));
              }}
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#506C7F]"
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              className={inputBase}
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de límite</label>
            <input
              type="date"
              className={inputBase}
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Activo */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-gray-700">Activo</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              form.active ? "bg-emerald-500" : "bg-gray-300"
            }`}
            aria-pressed={form.active}
            aria-label="Cambiar activo"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                form.active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </UiModal>
  );
}
