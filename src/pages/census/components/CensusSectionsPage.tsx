import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSections } from "../sections.service";
import type { Section, PaginationMeta, CensusFormValues } from "../census.interfaces";
import { createCensus } from "../censos.service";
import FormAlert from "./FormAlert";

function validateDraft(draft: CensusFormValues): string[] {
  const errs: string[] = [];

  if ((draft.description ?? "").trim().length < 10) {
    errs.push("La descripción debe tener al menos 10 caracteres.");
  }

  const start = (draft.start_date ?? "").trim();
  const end = (draft.end_date ?? "").trim();

  if ((start && !end) || (!start && end)) {
    errs.push("Captura ambas fechas: inicio y límite.");
  }

  if (start) {
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      errs.push("La fecha de inicio no es válida.");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);

      if (startDate.getTime() < today.getTime()) {
        errs.push("La fecha de inicio no puede ser anterior a hoy.");
      }
    }
  }

  if (start && end) {
    const s = new Date(start);
    const d = new Date(end);
    if (!isNaN(s.getTime()) && !isNaN(d.getTime())) {
      if (d.getTime() <= s.getTime()) {
        errs.push("La fecha límite debe ser posterior a la fecha de inicio.");
      }
    }
  }

  return errs;
}

export default function CensusSectionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as any) ?? {};
  const censusDraft: CensusFormValues | undefined = state.censusDraft;
  const unitsFromState: (string | number)[] = state.selectedUnits ?? [];
  const unitOrderFromState: Record<string | number, number | null> =
    state.unitOrder ?? {};

  const [sections, setSections] = useState<Section[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string | number>>(() => new Set());
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!censusDraft) return;

    const errs = validateDraft(censusDraft);
    if (errs.length > 0) {
      navigate("/censos/crear", {
        state: { censusDraft, validationErrors: errs },
        replace: true,
      });
    }
  }, [censusDraft, navigate]);

  const handleBack = () => {
    navigate("/censos/unidades", {
      state: {
        censusDraft,
        selectedUnits: unitsFromState,
        unitOrder: unitOrderFromState,
      },
    });
  };

  const toggleSection = (id: string | number) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getSections(page, "active");
        setSections(res.data);
        setMeta(res.meta);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error al cargar las secciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const handlePrevPage = () => {
    if (!meta) return;
    if (meta.current_page > 1) setPage(meta.current_page - 1);
  };

  const handleNextPageClick = () => {
    if (!meta) return;
    if (meta.current_page < meta.last_page) setPage(meta.current_page + 1);
  };

  const handleSaveCensus = async () => {
    setErrors([]);

    if (!censusDraft) {
      setErrors(["No se encontró el borrador del censo. Vuelve a crearlo."]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const draftErrs = validateDraft(censusDraft);
    if (draftErrs.length > 0) {
      navigate("/censos/crear", {
        state: { censusDraft, validationErrors: draftErrs },
        replace: true,
      });
      return;
    }

    const selectedSections = Array.from(selected);

    if (selectedSections.length === 0) {
      const confirmNoSections = confirm(
        "No has seleccionado secciones. ¿Quieres crear el censo de todos modos?"
      );
      if (!confirmNoSections) return;
    }

    try {
      setSaving(true);

      await createCensus({
        name: censusDraft.name,
        description: censusDraft.description,
        init_date: censusDraft.start_date || null,
        deadline: censusDraft.end_date || null,
        year: censusDraft.year,
        is_active: censusDraft.is_active,
      });

      navigate("/censos");
    } catch (err: any) {
      console.error(err);

      if (err?.type === "validation" && Array.isArray(err.messages)) {
        setErrors(err.messages);
      } else if (typeof err?.message === "string" && err.message.trim()) {
        setErrors([err.message]);
      } else {
        setErrors(["Ocurrió un error al crear el censo."]);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="bg-[var(--pantone-7421)] text-white rounded-xl px-4 py-3">
        <h1 className="text-lg font-semibold">Secciones</h1>
        <p className="text-xs mt-1 text-white/80">
          Selecciona las secciones que formarán parte del censo.
        </p>
      </header>

      {errors.length > 0 && <FormAlert messages={errors} />}

      <section className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-4 py-4">
          {loading && (
            <p className="text-center text-sm text-gray-500 py-4">
              Cargando secciones...
            </p>
          )}
          {error && <p className="text-center text-sm text-red-600 py-4">{error}</p>}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200 w-20">
                        Índice
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">
                        <div className="flex items-center gap-1">
                          <span>Nombre</span>
                          <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                        </div>
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 border-b border-gray-200 w-28">
                        Mostrar
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {sections.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                          Aún no hay secciones registradas.
                        </td>
                      </tr>
                    )}

                    {sections.map((section, index) => {
                      const isSelected = selected.has(section.id);

                      return (
                        <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                            {section.key ?? index + 1}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800 border-b border-gray-200">
                            {section.name}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => toggleSection(section.id)}
                                className={`
                                  inline-flex items-center justify-center
                                  w-9 h-5 rounded-full border transition-all
                                  ${
                                    isSelected
                                      ? "bg-[var(--pantone-7421)] border-[var(--pantone-7421)]"
                                      : "bg-gray-200 border-gray-300"
                                  }
                                `}
                              >
                                <span
                                  className={`
                                    w-4 h-4 bg-white rounded-full shadow-sm transform transition-all
                                    ${isSelected ? "translate-x-2.5" : "-translate-x-2.5"}
                                  `}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4 text-xs">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-50 disabled:opacity-40"
                    onClick={() => setPage(1)}
                    disabled={meta.current_page === 1}
                  >
                    «
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-50 disabled:opacity-40"
                    onClick={handlePrevPage}
                    disabled={meta.current_page === 1}
                  >
                    ‹
                  </button>

                  <span className="px-3 py-1 rounded-full border bg-white">
                    {meta.current_page} / {meta.last_page}
                  </span>

                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-50 disabled:opacity-40"
                    onClick={handleNextPageClick}
                    disabled={meta.current_page === meta.last_page}
                  >
                    ›
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-50 disabled:opacity-40"
                    onClick={() => setPage(meta.last_page)}
                    disabled={meta.current_page === meta.last_page}
                  >
                    N
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg px-4 py-3 flex justify-between border-t border-gray-200">
          <button
            type="button"
            onClick={handleBack}
            className="
              inline-flex items-center justify-center
              px-5 py-1.5 rounded-xl text-sm font-medium
              bg-[#DDC9A3] text-[#691B31]
              border border-[#DDC9A3]
              hover:bg-[#E0CEAA] hover:border-[#E0CEAA]
              hover:shadow-md active:scale-[0.97]
              transition-all duration-200
            "
          >
            Regresar
          </button>

          <button
            type="button"
            onClick={handleSaveCensus}
            disabled={saving}
            className="
              inline-flex items-center justify-center
              px-5 py-1.5 rounded-xl text-sm font-medium
              bg-[#DDC9A3] text-[#691B31]
              border border-[#DDC9A3]
              hover:bg-[#E0CEAA] hover:border-[#E0CEAA]
              hover:shadow-md active:scale-[0.97]
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {saving ? "Guardando..." : "Guardar censo"}
          </button>
        </div>
      </section>
    </div>
  );
}
