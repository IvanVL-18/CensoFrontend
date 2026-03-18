import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Search, X, CheckCircle, Building2 } from "lucide-react";
import { useSectionInstitutions } from "./useSectionInstitutions";
import Pagination from "../../../components/Pagination";

const SectionInstitutionsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    sectionInfo,
    institutions,
    allInstitutions,
    selectedIds,
    loading,
    saving,
    error,
    successMessage,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    setCurrentPage,
    toggleInstitution,
    toggleAll,
    saveChanges,
    clearMessages,
  } = useSectionInstitutions(id ?? "");

  const [selectAllOnPage, setSelectAllOnPage] = useState(false);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, clearMessages]);

  useEffect(() => {
    const allOnPageSelected =
      institutions.length > 0 &&
      institutions.every((inst) => selectedIds.has(String(inst.id)));
    setSelectAllOnPage(allOnPageSelected);
  }, [institutions, selectedIds]);

  const handleToggleAll = () => {
    toggleAll(!selectAllOnPage);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--pantone-7421)] border-t-transparent"></div>
              <p className="text-sm text-gray-600">Cargando instituciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[var(--pantone-7421)] px-6 py-4 text-white">
            <div>
              <h1 className="text-lg font-semibold">Asignar instituciones</h1>
              {sectionInfo && (
                <p className="text-sm text-white/80">
                  Sección: {sectionInfo.name} | Índice: {sectionInfo.index || "No especificado"}
                </p>
              )}
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

          {successMessage && (
            <div className="mx-6 mt-4 animate-slideDown rounded-xl border-l-4 border-green-500 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                {successMessage}
              </div>
            </div>
          )}
          {error && (
            <div className="mx-6 mt-4 animate-slideDown rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
              {error}
            </div>
          )}

          <div className="p-6">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar institución por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none transition focus:border-[var(--pantone-7421)] focus:ring-1 focus:ring-[var(--pantone-7421)]"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                  {selectedIds.size} de {allInstitutions.length} seleccionadas
                </span>
                <button
                  onClick={handleToggleAll}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {selectAllOnPage ? "Deseleccionar página" : "Seleccionar página"}
                </button>
              </div>
            </div>

            {institutions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16">
                <Building2 className="h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No hay instituciones que coincidan con tu búsqueda.</p>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {institutions.map((inst) => {
                  const instIdStr = String(inst.id);
                  const isSelected = selectedIds.has(instIdStr);

                  return (
                    <div
                      key={instIdStr}
                      onClick={() => toggleInstitution(inst.id, !isSelected)}
                      className={`
                        group relative cursor-pointer overflow-hidden rounded-xl border-2 p-5 shadow-sm transition-all
                        ${
                          isSelected
                            ? "border-[var(--pantone-7421)] bg-gradient-to-br from-green-50 to-white shadow-md"
                            : "border-gray-200 bg-white hover:border-[var(--pantone-7421)] hover:shadow-md"
                        }
                      `}
                    >
                      <div className="absolute right-2 top-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleInstitution(inst.id, e.target.checked);
                          }}
                          className="h-5 w-5 cursor-pointer rounded border-gray-300 text-[var(--pantone-7421)] transition focus:ring-[var(--pantone-7421)]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--pantone-7421)]/10 text-[var(--pantone-7421)]">
                          <Building2 size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{inst.name}</h3>
                      </div>

                      {isSelected && (
                        <div className="absolute bottom-2 right-2">
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Seleccionada
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  meta={{
                    current_page: currentPage,
                    last_page: totalPages,
                  }}
                  links={null}
                  onPageNumber={setCurrentPage}
                />
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 border-t border-gray-200 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:shadow-sm sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void saveChanges()}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--pantone-7421)] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--pantone-7421-dark, #8b4a2e)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Save size={18} />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionInstitutionsView;