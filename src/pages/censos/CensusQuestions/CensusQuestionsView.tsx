import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useCensusQuestions } from "./useCensusQuestions";
import Pagination from "../../../components/Pagination";
import { ViewQuestionModal } from "./ViewQuestionsModal";
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

const CensusQuestionsPageContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const openQuestionModal = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setModalOpen(true);
  };

  const closeQuestionModal = () => {
    setModalOpen(false);
    setSelectedQuestionId(null);
  };

  const {
    sectionInfo,
    indexes,
    rows,
    loading,
    paginating,
    saving,
    allChecked,
    currentPage,
    lastPage,
    paginationLinks,
    toggleQuestionRow,
    toggleAllQuestionRows,
    changeIndex,
    saveChanges,
    goToPage,
  } = useCensusQuestions(id ?? "");

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando preguntas...</p>
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
            <h1 className="text-lg font-semibold">Preguntas</h1>
            <p className="text-sm text-white/80">
              {sectionInfo
                ? `Sección: ${sectionInfo.name} — Índice: ${sectionInfo.index}`
                : "Asignación de preguntas"}
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
                          toggleAllQuestionRows(e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span>Seleccionar</span>
                    </div>
                  </th>
                  <th className="px-4 py-3">Pregunta</th>
                  <th className="px-4 py-3">Índice a asignar</th>
                  <th className="px-4 py-3">Asignación actual</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No hay preguntas disponibles.
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
                        key={row.question_id}
                        className={`border-t border-gray-200 text-sm text-gray-700 ${
                          row.checked ? "bg-green-50" : "bg-white"
                        }`}
                      >

                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={row.checked}
                            onChange={(e) =>
                              toggleQuestionRow(
                                row.question_name,
                                row.question_id,
                                e.target.checked,
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>


                        <td className="px-4 py-3 font-medium">
                          {row.question_name}
                        </td>


                        <td className="px-4 py-3">
                          <select
                            value={row.selected_index_id}
                            onChange={(e) =>
                              changeIndex(row.question_name, row.question_id, e.target.value)
                            }
                            disabled={!row.checked}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--pantone-7421)] disabled:cursor-not-allowed disabled:bg-gray-100"
                          >
                            <option value="">Selecciona un índice</option>
                            {indexes.map((idx) => (
                              <option key={idx.id} value={idx.id}>
                                {idx.name}
                              </option>
                            ))}
                          </select>
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
                          <button
                            type="button"
                            onClick={() => openQuestionModal(row.question_id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700"
                            title="Ver pregunta"
                          >
                            <Eye size={18} />
                          </button>
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

      <ViewQuestionModal
        isOpen={modalOpen}
        onClose={closeQuestionModal}
        questionId={selectedQuestionId}
      />

      <ToastContainer />
    </>
  );
};

export default function CensusQuestionsView() {
  return (
    <ToastProvider>
      <CensusQuestionsPageContent />
    </ToastProvider>
  );
}
