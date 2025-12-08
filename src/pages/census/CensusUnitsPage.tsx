// src/pages/census/CensusUnitsPage.tsx
import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUnits, type Unit, type PaginationMeta } from "./units.service";

export default function CensusUnitsPage() {
  const navigate = useNavigate();

  const [units, setUnits] = useState<Unit[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unidades seleccionadas para "Mostrar"
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  // Orden (índice) por unidad
  const [unitOrder, setUnitOrder] = useState<Record<string | number, number | null>>({});

  const handleBack = () => {
    navigate("/censos/crear");
  };

  const handleNext = () => {
    const selectedUnits = Array.from(selected);

    console.log("✅ Unidades seleccionadas:", selectedUnits);
    console.log("✅ Orden por unidad:", unitOrder);

    // Aquí más adelante enviarás todo al backend
    navigate("/censos/secciones", {
      state: {
        selectedUnits,
        unitOrder,
      },
    });
  };

  const toggleUnit = (id: string | number) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const handleOrderChange = (id: string | number, value: string) => {
    setUnitOrder((prev) => ({
      ...prev,
      [id]: value ? Number(value) : null,
    }));
  };

  // Cargar unidades desde API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getUnits(page, "active");
        setUnits(res.data);
        setMeta(res.meta);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error al cargar las unidades.");
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

  return (
    <div className="space-y-4">
      <header className="bg-[var(--pantone-7421)] text-white rounded-xl px-4 py-3">
        <h1 className="text-lg font-semibold">Unidades</h1>
        <p className="text-xs mt-1 text-white/80">
          Selecciona las unidades y define el orden en el que aparecerán en el censo.
        </p>
      </header>

      {/* Contenedor principal tipo card grande */}
      <section className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-4 py-4">
          {/* Estados de carga / error */}
          {loading && (
            <p className="text-center text-sm text-gray-500 py-4">
              Cargando unidades...
            </p>
          )}
          {error && (
            <p className="text-center text-sm text-red-600 py-4">{error}</p>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200 w-32">
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
                    {units.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-6 text-center text-sm text-gray-500"
                        >
                          Aún no hay unidades registradas.
                        </td>
                      </tr>
                    )}

                    {units.map((unit, index) => {
                      const isSelected = selected.has(unit.id);
                      const orderValue = unitOrder[unit.id] ?? "";

                      return (
                        <tr
                          key={unit.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* ÍNDICE → SELECT */}
                          <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                            <select
                              className="
                                w-full rounded-lg border border-gray-300 bg-white
                                px-2 py-1 text-xs text-gray-800
                                focus:outline-none focus:ring-1 focus:ring-[var(--pantone-7421)] focus:border-[var(--pantone-7421)]
                              "
                              value={orderValue}
                              onChange={(e) =>
                                handleOrderChange(unit.id, e.target.value)
                              }
                            >
                              <option value="">Sin orden</option>
                              {Array.from({ length: units.length }).map(
                                (_, idx) => (
                                  <option key={idx + 1} value={idx + 1}>
                                    {idx + 1}
                                  </option>
                                )
                              )}
                            </select>
                          </td>

                          {/* NOMBRE */}
                          <td className="px-4 py-2 text-sm text-gray-800 border-b border-gray-200">
                            {unit.name}
                          </td>

                          {/* MOSTRAR → SWITCH VINO */}
                          <td className="px-4 py-2 border-b border-gray-200">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => toggleUnit(unit.id)}
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
                                    ${
                                      isSelected
                                        ? "translate-x-2.5"
                                        : "-translate-x-2.5"
                                    }
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

              {/* Paginación simple usando meta */}
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

        {/* Footer rojo con botones Regresar / Siguiente */}
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
            onClick={handleNext}
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
            Siguiente
          </button>
        </div>
      </section>
    </div>
  );
}
