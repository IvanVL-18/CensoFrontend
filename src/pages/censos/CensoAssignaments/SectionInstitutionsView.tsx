import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Search } from "lucide-react";
import { useSectionInstitutions } from "./useSectionInstitutions";
import Pagination from "../../../components/Pagination";

const SectionInstitutionsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    sectionInfo,
    institutions,
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

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, clearMessages]);

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando instituciones...</p>
        </div>
      </div>
    );
  }

  const allChecked =
    institutions.length > 0 &&
    institutions.every((inst) => selectedIds.has(String(inst.id)));

  return (
    <div className="w-full p-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Cabecera */}
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

        {/* Mensajes */}
        {successMessage && (
          <div className="mx-6 mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="p-6">
          {/* Buscador */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar institución por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--pantone-7421)]"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="relative overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span>Seleccionar</span>
                    </div>
                  </th>
                  <th className="px-4 py-3">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {institutions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No hay instituciones que coincidan.
                    </td>
                  </tr>
                ) : (
                  institutions.map((inst) => {
                    const instIdStr = String(inst.id);
                    const isSelected = selectedIds.has(instIdStr);

                    return (
                      <tr
                        key={instIdStr}
                        className={`border-t border-gray-200 text-sm text-gray-700 ${
                          isSelected ? "bg-green-50" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              toggleInstitution(inst.id, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{inst.name}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-4">
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

          {/* Botones */}
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

export default SectionInstitutionsView;