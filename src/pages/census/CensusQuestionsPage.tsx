import { useState } from "react";
import { ChevronDown, Plus, Info } from "lucide-react";
import type { Census } from "./census.interfaces";

type Props = {
  census?: Census | null;
};

export default function CensusQuestions({ census }: Props) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const [questionText, setQuestionText] = useState("");
  const [optionText, setOptionText] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fakeQuestions = [
    { id: "1", text: "Pregunta de ejemplo 1" },
    { id: "2", text: "Pregunta de ejemplo 2" },
  ];

  const censusName = census?.name ?? "este censo";

  const handleAddOption = () => {
    if (!optionText.trim()) return;
    setOptions((prev) => [...prev, optionText.trim()]);
    setOptionText("");
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!census?.id) {
      setErrorMessage(
        "No se recibió el identificador del censo. Vuelve a la lista y selecciona un censo de nuevo."
      );
      return;
    }

    if (!questionText.trim()) {
      setErrorMessage("Escribe la pregunta antes de guardar.");
      return;
    }

    try {
      setSaving(true);

      setSuccessMessage("Pregunta guardada correctamente.");
      setQuestionText("");
      setOptionText("");
      setOptions([]);
      setSelectedQuestionId(null);
    } catch (err: any) {
      console.error(err);
      if (err?.type === "validation") {
        setErrorMessage((err.messages as string[]).join(" • "));
      } else if (err?.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocurrió un error al guardar la pregunta.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-[var(--pantone-7421)] text-white px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide opacity-90">
            Configuración del censo
          </p>
          <h2 className="text-sm md:text-base font-semibold">
            Censo nacional (secciones)
          </h2>
        </div>
        <p className="text-[11px] md:text-xs opacity-80">
          Paso 3 de 3 · Preguntas
        </p>
      </div>

      <div className="px-6 pt-4 pb-6 space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
            <Info className="w-4 h-4 mt-[2px]" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
            <Info className="w-4 h-4 mt-[2px]" />
            <p>{successMessage}</p>
          </div>
        )}

        <p className="text-xs text-neutral-600">
          Aquí puedes <span className="font-semibold">crear</span> o{" "}
          <span className="font-semibold">editar</span> las preguntas que
          formarán parte de <span className="italic">{censusName}</span>.
        </p>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] mt-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800">
                Preguntas existentes
              </h3>
              <span className="text-[11px] text-neutral-500">
                {fakeQuestions.length} registradas
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-neutral-50/70 p-3 space-y-3">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Selecciona una pregunta para editarla
              </label>

              <div className="relative">
                <select
                  value={selectedQuestionId ?? ""}
                  onChange={(e) => setSelectedQuestionId(e.target.value || null)}
                  className="
                    w-full h-[42px] rounded-xl border border-gray-300
                    bg-white pl-3 pr-10 text-sm text-neutral-800
                    focus:outline-none focus:ring-2 focus:ring-[#DDC9A3] focus:border-[#DDC9A3]
                    appearance-none
                  "
                >
                  <option value="">Seleccione preguntas</option>
                  {fakeQuestions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.text}
                    </option>
                  ))}
                </select>

                <span
                  className="
                    pointer-events-none absolute inset-y-0 right-0
                    flex items-center justify-center w-9
                    rounded-r-xl bg-[#DDC9A3]
                  "
                >
                  <ChevronDown className="w-4 h-4 text-[#691B31]" />
                </span>
              </div>

              <p className="text-[11px] text-neutral-500">
                Más adelante esta lista se llenará con las preguntas que vengan de la API.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-neutral-800">
              Crear / editar pregunta
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-700">
                Pregunta
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe la pregunta"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="
                    flex-1 h-[44px] rounded-xl border border-gray-300
                    bg-white px-3 text-sm text-neutral-800
                    focus:outline-none focus:ring-2 focus:ring-[#DDC9A3] focus:border-[#DDC9A3]
                  "
                />
                <button
                  type="button"
                  className="
                    inline-flex items-center justify-center
                    h-[44px] w-[44px] rounded-xl
                    bg-[#DDC9A3] text-[#691B31]
                    border border-[#DDC9A3]
                    hover:bg-[#E0CEAA] transition-colors
                  "
                  title="Agregar una nueva pregunta a la lista (futuro comportamiento)"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tipo de pregunta (pendiente) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-700">
                Tipo de Pregunta
              </label>
              <div className="text-xs text-neutral-500">
                (Pendiente de integrar selector de tipo)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-neutral-700">
                  Opciones de respuesta
                </label>
                <span className="text-[11px] text-neutral-500">
                  Útil para listas y opciones múltiples
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe una opción"
                  value={optionText}
                  onChange={(e) => setOptionText(e.target.value)}
                  className="
                    flex-1 h-[44px] rounded-xl border border-gray-300
                    bg-white px-3 text-sm text-neutral-800
                    focus:outline-none focus:ring-2 focus:ring-[#DDC9A3] focus:border-[#DDC9A3]
                  "
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="
                    inline-flex items-center justify-center
                    h-[44px] w-[44px] rounded-xl
                    bg-[#DDC9A3] text-[#691B31]
                    border border-[#DDC9A3]
                    hover:bg-[#E0CEAA] transition-colors
                  "
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {options.length === 0 ? (
                <p className="text-[11px] text-neutral-500 mt-3">
                  Aún no se han añadido opciones. Puedes empezar agregando “Sí”, “No”, “No aplica”, etc.
                </p>
              ) : (
                <ul className="mt-3 space-y-1 text-sm text-neutral-800">
                  {options.map((opt, idx) => (
                    <li
                      key={`${opt}-${idx}`}
                      className="
                        flex items-center justify-between bg-neutral-50
                        border border-gray-200 rounded-lg px-3 py-1.5
                      "
                    >
                      <span>{opt}</span>
                      <span className="text-[11px] text-neutral-500">
                        Opción {idx + 1}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              inline-flex items-center justify-center
              px-6 h-[40px] rounded-xl text-sm font-medium
              bg-[#DDC9A3] text-[#691B31]
              border border-[#DDC9A3]
              hover:bg-[#E0CEAA] transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {saving ? "Guardando..." : "Guardar pregunta"}
          </button>
        </div>
      </div>
    </div>
  );
}
