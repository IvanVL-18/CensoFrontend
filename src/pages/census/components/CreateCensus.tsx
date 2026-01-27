import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormAlert from "./FormAlert";
import type { CensusFormValues } from "../census.interfaces";

export default function CreateCensusPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromState = (location.state as any) ?? {};
  const draft: CensusFormValues | undefined = fromState.censusDraft;
  const backErrors: string[] | undefined = fromState.validationErrors;

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

  useEffect(() => {
    if (backErrors?.length) setErrors(backErrors);

  }, []);

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

    const nextErrors: string[] = [];

    if (!form.name.trim()) nextErrors.push("El nombre es obligatorio.");
    if (!String(form.year ?? "").trim()) nextErrors.push("El año es obligatorio.");

    if ((form.description ?? "").trim().length < 10) {
      nextErrors.push("La descripción debe tener al menos 10 caracteres.");
    }

    const start = (form.start_date ?? "").trim();
    const end = (form.end_date ?? "").trim();

    if ((start && !end) || (!start && end)) {
      nextErrors.push("Captura ambas fechas: inicio y límite.");
    }

    if (start) {
      const startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        nextErrors.push("La fecha de inicio no es válida.");
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        if (startDate.getTime() < today.getTime()) {
          nextErrors.push("La fecha de inicio no puede ser anterior a hoy.");
        }
      }
    }

    if (start && end) {
      const s = new Date(start);
      const d = new Date(end);

      if (isNaN(d.getTime())) nextErrors.push("La fecha de límite no es válida.");

      if (!isNaN(s.getTime()) && !isNaN(d.getTime())) {
        if (d.getTime() <= s.getTime()) {
          nextErrors.push("La fecha límite debe ser posterior a la fecha de inicio.");
        }
      }
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    navigate("/censos/unidades", {
      state: { censusDraft: form },
    });
  };

  const handleCancel = () => {
    navigate("/censos");
  };

  return (
    <div className="space-y-4">
      <header className="bg-[#7C1227] text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-semibold">Crear nuevo censo</h1>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && <FormAlert messages={errors} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre del censo"
                className="
                  w-full rounded-xl border border-gray-300 bg-white
                  px-3 py-2 text-sm text-gray-800
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C1227]/25 focus:border-[#7C1227]/40
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
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C1227]/25 focus:border-[#7C1227]/40
                "
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción breve del censo"
              rows={3}
              className="
                w-full rounded-xl border border-gray-300 bg-white
                px-3 py-2 text-sm text-gray-800
                shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C1227]/25 focus:border-[#7C1227]/40
                resize-none
              "
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Fecha de inicio</label>
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
              <label className="text-xs font-medium text-gray-700">Fecha de límite</label>
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

          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleToggleActive}
              className={`
                relative flex items-center w-14 h-7 rounded-full transition-all duration-300 shadow-inner
                ${form.is_active ? "bg-[#0B7A63]/20" : "bg-gray-300"}
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
                form.is_active ? "text-[#0B7A63]" : "text-gray-500"
              }`}
            >
              {form.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>

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
                bg-[#7C1227] text-white border border-[#7C1227]
                hover:bg-[#5a0e1a] hover:border-[#5a0e1a]
                hover:shadow-sm active:scale-[0.98]
                transition-all duration-200
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
