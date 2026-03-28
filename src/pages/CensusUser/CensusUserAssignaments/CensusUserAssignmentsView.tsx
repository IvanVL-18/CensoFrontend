import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Search, Building2 } from "lucide-react";
import { useCensusAssignments } from "./UseCensusUserAssignments";

const CensusAssignmentsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    sectionInfo,
    rows,
    loading,
    saving,
    error,
    searchQuery,
    setSearchQuery,
    toggleRow,
    saveChanges,
  } = useCensusAssignments(id ?? "");

  const filteredRows = useMemo(
    () =>
      rows.filter((r) =>
        r.institution_name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [rows, searchQuery],
  );

  const selectedCount = rows.filter((r) => r.checked).length;

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando instituciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-[var(--pantone-7421)] px-6 py-4 text-white">
          <div>
            <h1 className="text-lg font-semibold">Asignar instituciones</h1>
            <p className="text-sm text-white/80">
              {sectionInfo
                ? `Sección: ${sectionInfo.name} | Índice: ${sectionInfo.index}`
                : "Asignación de instituciones"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Cerrar
          </button>
        </div>

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar institución por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-[var(--pantone-7421)]"
              />
            </div>
            <span className="whitespace-nowrap rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {selectedCount} de {rows.length} seleccionadas
            </span>
            <button
              type="button"
              onClick={() =>
                filteredRows.forEach((r) =>
                  toggleRow(
                    r.institution_id,
                    !filteredRows.every((fr) => fr.checked),
                  ),
                )
              }
              className="whitespace-nowrap rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
            >
              Seleccionar página
            </button>
          </div>

          {filteredRows.length === 0 ? (
            <div className="rounded-xl border border-gray-200 py-12 text-center text-sm text-gray-500">
              {searchQuery
                ? "No se encontraron instituciones con ese nombre."
                : "No hay instituciones disponibles."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filteredRows.map((row) => {
                return (
                  <div
                    key={row.institution_id}
                    onClick={() => toggleRow(row.institution_id, !row.checked)}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all select-none ${
                      row.checked
                        ? "border-[#1D9E75] bg-[#E1F5EE]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border text-xs transition-all ${
                        row.checked
                          ? "border-[#1D9E75] bg-[#1D9E75] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {row.checked && "✓"}
                    </div>

                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${
                        row.checked ? "bg-[#BC955B]" : "bg-[#691B31]"
                      }`}
                    >
                      <Building2 size={20} color="#fff" />
                    </div>

                    <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-800">
                      {row.institution_name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void saveChanges()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CensusAssignmentsView;
