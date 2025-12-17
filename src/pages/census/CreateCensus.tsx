// src/pages/census/CreateCensusPage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormAlert from "./FormAlert";

export type CensusFormValues = {
  name: string;
  year: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export default function CreateCensusPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromState = (location.state as any) ?? {};
  const draft: CensusFormValues | undefined = fromState.censusDraft;

  const [form, setForm] = useState<CensusFormValues>(
    draft ?? {
      name: "",
      year: "",
      description: "",
      start_date: "",
      end_date: "",
      is_active: true,
    }
  );

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = () => {
    setForm((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!form.name.trim() || !form.year.trim()) {
      setErrors(["El nombre y el año son obligatorios."]);
      return;
    }

    setSubmitting(true);

    // 👉 solo pasamos el borrador, no creamos nada en el backend todavía
    navigate("/censos/unidades", {
      state: {
        censusDraft: form,
      },
    });

    setSubmitting(false);
  };

  const handleCancel = () => {
    navigate("/censos");
  };

  return (
    <div className="space-y-4">
      <header className="bg-[var(--pantone-7421)] text-white rounded-xl px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Crear nuevo censo</h1>
      </header>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && <FormAlert messages={errors} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre del censo"
                className="
                  w-full rounded-xl border border-gray-300 bg-white
                  px-3 py-2 text-sm text-gray-800
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BC955B] focus:border-[#BC955B]
                "
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Año</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="Año"
                className="
                  w-full rounded-xl border border-gray-300 bg-white
                  px-3 py-2 text-sm text-gray-800
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BC955B] focus:border-[#BC955B]
                "
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción breve del censo"
              rows={3}
              className="
                w-full rounded-xl border border-gray-300 bg-white
                px-3 py-2 text-sm text-gray-800
                shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BC955B] focus:border-[#BC955B]
                resize-none
              "
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Fecha de inicio
              </label>
              <div className="flex items-stretch rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Fecha de límite
              </label>
              <div className="flex items-stretch rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleToggleActive}
              className={`
                relative flex items-center w-14 h-7 rounded-full transition-all duration-300 shadow-inner
                ${form.is_active ? "bg-[#BC955B]" : "bg-gray-300"}
              `}
            >
              <span
                className={`
                  absolute w-6 h-6 rounded-full bg-white shadow-md transform transition-all duration-300
                  ${form.is_active ? "translate-x-7" : "translate-x-1"}
                `}
              />
            </button>

            <span
              className={`text-sm font-medium transition-colors ${
                form.is_active ? "text-[#BC955B]" : "text-gray-500"
              }`}
            >
              {form.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="
                px-4 py-2 rounded-xl text-sm font-medium
                border border-gray-300 text-gray-700 bg-white
                hover:bg-gray-50 transition-colors
              "
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="
                px-4 py-2 rounded-xl text-sm font-medium
                bg-[#BC955B] text-white border border-[#BC955B]
                hover:bg-[#a8824f] hover:border-[#a8824f]
                hover:shadow-md active:scale-[0.97]
                transition-all duración-200
              "
              disabled={submitting}
            >
              Siguiente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
