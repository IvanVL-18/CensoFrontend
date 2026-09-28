import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Mail,
  FileDown,
  Sheet,
} from "lucide-react";
import {
  getInstitutionUsers,
  getAnswersForReport,
} from "./AdminAnswers.service";
import type { InstitutionUsersResponse } from "./AdminAnswers.types";
import { generateAnswersPdf } from "./generateAnswersPdf";
import { generateAnswersExcel } from "./generateAnswersExcel";
import AddButton from "../../components/AddButton";
import { useAdminAnswersMutations } from "./hooks/UseAdminAnswersMutations";
import { BulkAnswersErrorModal } from "./BulkAnswersErrorModal";

export default function InstitutionUsersPage() {
  const { censusId, institutionId } = useParams<{
    censusId: string;
    institutionId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [data, setData] = useState<InstitutionUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<Record<string, boolean>>({});
  const [pdfError, setPdfError] = useState<Record<string, string>>({});
  const [xlsxLoading, setXlsxLoading] = useState<Record<string, boolean>>({});
  const [xlsxError, setXlsxError] = useState<Record<string, string>>({});

  const {
    fileInputRef,
    bulkLoading,
    bulkErrors,
    bulkErrorModalOpen,
    openFilePicker,
    handleFileChange,
    closeBulkErrorModal,
  } = useAdminAnswersMutations();

  useEffect(() => {
    if (!censusId || !institutionId) return;
    setLoading(true);
    setError(null);

    getInstitutionUsers(censusId, institutionId)
      .then(setData)
      .catch((err) => setError(err?.message ?? "Error al cargar los usuarios."))
      .finally(() => setLoading(false));
  }, [censusId, institutionId]);

  const handleUserClick = (userId: string) => {
    navigate(
      `/admin/censos/${encodeURIComponent(censusId!)}/instituciones/${encodeURIComponent(institutionId!)}/usuarios/${encodeURIComponent(userId)}/respuestas?from=${encodeURIComponent(from)}`,
    );
  };

  const handleDownloadPdf = async (userId: string) => {
    if (!censusId || !institutionId) return;
    setPdfLoading((prev) => ({ ...prev, [userId]: true }));
    setPdfError((prev) => ({ ...prev, [userId]: "" }));
    try {
      const reportData = await getAnswersForReport(
        censusId,
        institutionId,
        userId,
      );
      await generateAnswersPdf(reportData);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al generar el PDF.";
      setPdfError((prev) => ({ ...prev, [userId]: msg }));
    } finally {
      setPdfLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDownloadExcel = async (userId: string) => {
    if (!censusId || !institutionId) return;
    setXlsxLoading((prev) => ({ ...prev, [userId]: true }));
    setXlsxError((prev) => ({ ...prev, [userId]: "" }));
    try {
      const reportData = await getAnswersForReport(
        censusId,
        institutionId,
        userId,
      );
      await generateAnswersExcel(reportData);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al generar el Excel.";
      setXlsxError((prev) => ({ ...prev, [userId]: msg }));
    } finally {
      setXlsxLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const backToInstitutions = () =>
    navigate(
      `/admin/censos/${encodeURIComponent(censusId!)}/instituciones?from=${encodeURIComponent(from)}`,
    );

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
        <button
          onClick={() => navigate(from)}
          className="hover:text-slate-800 transition-colors"
        >
          {from === "/censos" ? "Censos" : "Dashboard"}
        </button>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <button
          onClick={backToInstitutions}
          className="hover:text-slate-800 transition-colors truncate max-w-[160px]"
        >
          {data?.census.name ?? "Censo"}
        </button>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-slate-800 truncate max-w-[160px]">
          {data?.institution.name ?? "Institución"}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-slate-400">Usuarios</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#7A0C2E] px-5 py-4 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={backToInstitutions}
              className="rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-white font-semibold text-base leading-tight">
                {data?.institution.name ?? "Institución"}
              </p>
              <p className="text-white/60 text-xs mt-0.5">
                Usuarios que han respondido en este censo
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <AddButton
            label={bulkLoading ? "Cargando…" : "Carga Masiva"}
            onClick={openFilePicker}
            icon={
              bulkLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )
            }
            variant="green"
            disabled={bulkLoading}
          />
        </div>

        {/* Body */}
        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Cargando usuarios...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!loading && !error && data && data.users.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                Ningún usuario ha respondido en esta institución.
              </p>
            </div>
          )}

          {!loading && !error && data && data.users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Correo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {data.users.map((user, i) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-400 w-10">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">
                          {user.name} {user.lastname}
                        </p>
                        <p className="text-xs text-slate-400 sm:hidden flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Mail className="h-4 w-4 shrink-0 text-slate-300" />
                          {user.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleUserClick(user.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7A0C2E] border border-[#7A0C2E]/30 hover:bg-[#7A0C2E] hover:text-white transition-colors"
                          >
                            Ver respuestas
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDownloadPdf(user.id)}
                            disabled={pdfLoading[user.id]}
                            title={pdfError[user.id] || "Descargar PDF"}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {pdfLoading[user.id] ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileDown className="h-3.5 w-3.5" />
                            )}
                            {pdfLoading[user.id] ? "Generando…" : "PDF"}
                          </button>

                          <button
                            onClick={() => handleDownloadExcel(user.id)}
                            disabled={xlsxLoading[user.id]}
                            title={xlsxError[user.id] || "Descargar Excel"}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-800 border border-green-400 hover:bg-green-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {xlsxLoading[user.id] ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sheet className="h-3.5 w-3.5" />
                            )}
                            {xlsxLoading[user.id] ? "Generando…" : "Excel"}
                          </button>
                        </div>

                        {pdfError[user.id] && (
                          <p className="text-xs text-red-500 mt-1 text-center">
                            {pdfError[user.id]}
                          </p>
                        )}
                        {xlsxError[user.id] && (
                          <p className="text-xs text-red-500 mt-1 text-center">
                            {xlsxError[user.id]}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BulkAnswersErrorModal
        isOpen={bulkErrorModalOpen}
        errors={bulkErrors}
        onClose={closeBulkErrorModal}
      />
    </div>
  );
}
