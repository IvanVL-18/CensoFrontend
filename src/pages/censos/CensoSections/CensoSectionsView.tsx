import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye, ArrowRight, Landmark } from "lucide-react";
import { useCensoSections } from "./useCensoSections";
import Pagination from "../../../components/Pagination";
import { SearchInput } from "../../../components/SearchInput";
import { IndexCombobox } from "../../../components/IndexCombobox";
import { ViewSectionModal } from "./ViewSectionsModal";
import { AssignInstitutionsModal } from "./AssignInstitutionsModal";
import { ToastProvider, useToast } from "../../../context/ToastContext";
import { Toast } from "../../../components/Toast";

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

const CensoSectionsPageContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    moduleInfo,
    indexes,
    rows,
    loading,
    paginating,
    saving,
    allChecked,
    currentPage,
    lastPage,
    paginationLinks,
    searchTerm,
    setSearchTerm,
    searchError,
    usedIndexIds,
    toggleSectionRow,
    toggleAllSectionRows,
    selectIndex,
    searchIndexes,
    saveChanges,
    goToPage,
  } = useCensoSections(id ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const openSectionModal = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setModalOpen(true);
  };

  const closeSectionModal = () => {
    setModalOpen(false);
    setSelectedSectionId(null);
  };

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSectionId, setAssignSectionId] = useState<string | null>(null);
  const [assignSectionName, setAssignSectionName] = useState("");

  const openAssignModal = (censusSectionId: string, name: string) => {
    setAssignSectionId(censusSectionId);
    setAssignSectionName(name);
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setAssignSectionId(null);
    setAssignSectionName("");
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando secciones...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[var(--pantone-7421)] px-6 py-4 text-white">
            <div>
              <h1 className="text-lg font-semibold">Secciones</h1>
              <p className="text-sm text-white/80">
                {moduleInfo
                  ? `Módulo: ${moduleInfo.name}`
                  : "Asignación de secciones"}
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

          <div className="p-6">
            <div className="mb-4 w-full max-w-md rounded-xl border border-gray-200">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar sección por nombre..."
              />
            </div>

            <div className="relative overflow-x-auto rounded-xl border border-gray-200">
              {paginating && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
                  <span className="text-sm text-gray-400">
                    Cargando página...
                  </span>
                </div>
              )}

              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={(e) =>
                            toggleAllSectionRows(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span>Seleccionar</span>
                      </div>
                    </th>
                    <th className="px-4 py-3">Sección</th>
                    <th className="px-4 py-3">Índice a asignar</th>
                    <th className="px-4 py-3">Asignación actual</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className={`px-4 py-6 text-center text-sm ${
                          searchError ? "text-red-600" : "text-gray-500"
                        }`}
                      >
                        {searchError ??
                          (searchTerm.trim()
                            ? "No se encontraron secciones para la búsqueda."
                            : "No hay secciones disponibles.")}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const selectedIndexName = indexes.find(
                        (idx) =>
                          String(idx.id) === String(row.selected_index_id),
                      )?.name;

                      return (
                        <tr
                          key={row.key}
                          className={`border-t border-gray-200 text-sm text-gray-700 ${
                            row.checked ? "bg-green-50" : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={row.checked}
                              onChange={(e) =>
                                toggleSectionRow(
                                  row.key,
                                  row.section_id,
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {row.section_name}
                          </td>

                          <td className="px-4 py-3">
                            <IndexCombobox
                              value={row.selected_index_id}
                              valueName={
                                row.selected_index_id
                                  ? (selectedIndexName ??
                                    row.stored_index_name ??
                                    "")
                                  : ""
                              }
                              onSelect={(option) =>
                                selectIndex(row.key, option)
                              }
                              search={searchIndexes}
                              excludedIds={usedIndexIds}
                              disabled={!row.checked}
                            />
                          </td>

                          <td className="px-4 py-3">
                            {row.checked ? (
                              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                {selectedIndexName ??
                                  row.stored_index_name ??
                                  "Sin asignar"}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                {row.stored_index_name ?? "Sin asignar"}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => openSectionModal(row.section_id)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700"
                                title="Ver sección"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                type="button"
                                disabled={!row.census_section_id}
                                onClick={() => {
                                  if (row.census_section_id) {
                                    openAssignModal(
                                      row.census_section_id,
                                      row.section_name,
                                    );
                                  }
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                                title={
                                  row.census_section_id
                                    ? "Asignar institución"
                                    : "Guarda primero la sección para asignar instituciones"
                                }
                              >
                                <Landmark size={18} />
                              </button>
                              <button
                                type="button"
                                disabled={
                                  !row.checked || !row.census_section_id
                                }
                                onClick={() => {
                                  if (row.census_section_id) {
                                    navigate(
                                      `/censos/preguntas/${row.census_section_id}`,
                                    );
                                  }
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                title={
                                  row.checked && row.census_section_id
                                    ? "Asignar preguntas"
                                    : "Selecciona la sección primero"
                                }
                              >
                                <ArrowRight size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Pagination
                meta={{ current_page: currentPage, last_page: lastPage }}
                links={paginationLinks}
                onPageNumber={goToPage}
              />
            </div>

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

      <ViewSectionModal
        isOpen={modalOpen}
        onClose={closeSectionModal}
        sectionId={selectedSectionId}
      />

      <AssignInstitutionsModal
        isOpen={assignModalOpen}
        censusSectionId={assignSectionId}
        sectionName={assignSectionName}
        onClose={closeAssignModal}
      />

      <ToastContainer />
    </>
  );
};

export default function CensoSectionsView() {
  return (
    <ToastProvider>
      <CensoSectionsPageContent />
    </ToastProvider>
  );
}
