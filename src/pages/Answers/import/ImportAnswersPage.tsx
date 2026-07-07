import { useCallback, useEffect, useState } from "react";
import { ToastProvider, useToast } from "../../../context/ToastContext";
import { Toast } from "../../../components/Toast";
import {
  getCensuses,
  uploadImportPreview,
  confirmImport,
} from "./ImportAnswers.service";
import type {
  CensusOption,
  ImportConfirmResponse,
  ImportPreviewResponse,
  ImportUserOption,
} from "./ImportAnswers.types";
import { UserSelect } from "./components/UserSelect";
import { QuestionsPreviewTable } from "./components/QuestionsPreviewTable";

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

type Step = "upload" | "preview" | "done";

function ImportAnswersContent() {
  const { addToast } = useToast();

  const [step, setStep] = useState<Step>("upload");
  const [censuses, setCensuses] = useState<CensusOption[]>([]);
  const [censusId, setCensusId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [targetUser, setTargetUser] = useState<ImportUserOption | null>(null);
  const [report, setReport] = useState<ImportConfirmResponse | null>(null);

  useEffect(() => {
    getCensuses()
      .then(setCensuses)
      .catch(() => addToast("No se pudieron cargar los censos.", "danger"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apiError = (error: unknown, fallback: string) => {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? fallback;
    addToast(message, "danger");
  };

  // ── Fase 1: subir y previsualizar ──
  const handlePreview = useCallback(async () => {
    if (!censusId || !file) return;
    setLoading(true);
    try {
      const result = await uploadImportPreview(censusId, file);
      setPreview(result);
      setTargetUser(
        result.suggested_user
          ? {
              id: result.suggested_user.id_encrypted,
              name: result.suggested_user.name,
              email: result.suggested_user.email,
              institution: result.suggested_user.institution,
            }
          : null
      );
      setStep("preview");
    } catch (error) {
      apiError(error, "No fue posible procesar el archivo.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [censusId, file]);

  // ── Fase 2: confirmar ──
  const handleConfirm = useCallback(async () => {
    if (!preview || !targetUser) return;
    setLoading(true);
    try {
      const result = await confirmImport(preview.batch_id, targetUser.id);
      setReport(result);
      setStep("done");
      addToast(result.message, "success");
    } catch (error) {
      apiError(error, "No fue posible confirmar la importación.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, targetUser]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setTargetUser(null);
    setReport(null);
  }, []);

  const downloadReport = useCallback(() => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte-importacion.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [report]);

  const canConfirm =
    !!preview && !!targetUser && preview.totals.ok + preview.totals.con_advertencias > 0;

  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
      <ToastContainer />

      <div className="flex items-center bg-[var(--pantone-7421)] p-4">
        <h1 className="text-xl font-bold text-white md:text-2xl">
          Importar respuestas desde Excel (INEGI)
        </h1>
      </div>

      <div className="p-6">
        {step === "upload" && (
          <div className="mx-auto max-w-xl space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Censo destino
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={censusId}
                onChange={(e) => setCensusId(e.target.value)}
              >
                <option value="">Selecciona un censo…</option>
                {censuses.map((census) => (
                  <option key={census.id} value={census.id}>
                    {census.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) setFile(dropped);
              }}
            >
              {file ? (
                <>
                  <p className="font-medium text-gray-800">📄 {file.name}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-blue-600 hover:underline"
                    onClick={() => setFile(null)}
                  >
                    Quitar archivo
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600">
                    Arrastra aquí el archivo <strong>.xlsx</strong> del
                    cuestionario INEGI
                  </p>
                  <label className="mt-3 cursor-pointer rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                    Elegir archivo
                    <input
                      type="file"
                      accept=".xlsx"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </>
              )}
            </div>

            <button
              type="button"
              disabled={!censusId || !file || loading}
              className="w-full rounded-lg bg-[var(--pantone-7421)] px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handlePreview}
            >
              {loading ? "Procesando archivo…" : "Analizar archivo"}
            </button>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-6">
            {/* Informante detectado */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <h2 className="mb-2 font-semibold text-gray-800">
                  Informante detectado
                </h2>
                <dl className="space-y-1 text-sm text-gray-700">
                  <div>
                    <dt className="inline font-medium">Institución: </dt>
                    <dd className="inline">
                      {preview.informant.institucion ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Nombre: </dt>
                    <dd className="inline">
                      {preview.informant.nombre_completo || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Correo: </dt>
                    <dd className="inline">{preview.informant.correo ?? "—"}</dd>
                  </div>
                  {preview.entidad && (
                    <div>
                      <dt className="inline font-medium">Entidad: </dt>
                      <dd className="inline">
                        {preview.entidad.nombre}
                        {preview.entidad.clave
                          ? ` (clave ${preview.entidad.clave})`
                          : ""}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Usuario destino */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h2 className="mb-2 font-semibold text-gray-800">
                  Usuario destino
                </h2>
                {preview.suggested_user && (
                  <p className="mb-2 text-xs text-gray-500">
                    Sugerido por{" "}
                    {preview.suggested_user.match_reason === "correo"
                      ? "coincidencia de correo"
                      : "coincidencia de institución"}
                    . Confírmalo o cámbialo antes de importar.
                  </p>
                )}
                {!preview.suggested_user && (
                  <p className="mb-2 text-xs text-yellow-700">
                    No se encontró un usuario que coincida con el informante;
                    selecciona uno manualmente.
                  </p>
                )}
                <UserSelect selected={targetUser} onSelect={setTargetUser} />
              </div>
            </div>

            {/* Resumen por pregunta */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">
                  Preguntas detectadas
                </h2>
                <p className="text-sm text-gray-600">
                  {preview.totals.ok} OK · {preview.totals.con_advertencias}{" "}
                  con advertencias · {preview.totals.errores} con error
                </p>
              </div>
              <QuestionsPreviewTable questions={preview.questions} />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={handleReset}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canConfirm || loading}
                onClick={handleConfirm}
              >
                {loading ? "Importando…" : "Confirmar importación"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && report && (
          <div className="mx-auto max-w-xl space-y-4 text-center">
            <p className="text-5xl">✅</p>
            <h2 className="text-lg font-semibold text-gray-800">
              Importación completada
            </h2>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-2xl font-bold text-green-700">
                  {report.created}
                </p>
                <p className="text-gray-600">creadas</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-2xl font-bold text-blue-700">
                  {report.updated}
                </p>
                <p className="text-gray-600">actualizadas</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-2xl font-bold text-gray-700">
                  {report.comments_saved}
                </p>
                <p className="text-gray-600">comentarios</p>
              </div>
            </div>

            {report.skipped.length > 0 && (
              <p className="text-sm text-gray-600">
                Preguntas omitidas (con error en el preview):{" "}
                {report.skipped.join(", ")}
              </p>
            )}
            {report.warnings.length > 0 && (
              <div className="rounded-lg bg-yellow-50 p-3 text-left">
                {report.warnings.map((warning, i) => (
                  <p key={i} className="text-sm text-yellow-800">
                    ⚠ {warning}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={downloadReport}
              >
                Descargar reporte (JSON)
              </button>
              <button
                type="button"
                className="rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white"
                onClick={handleReset}
              >
                Importar otro archivo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ImportAnswersPage() {
  return (
    <ToastProvider>
      <ImportAnswersContent />
    </ToastProvider>
  );
}
