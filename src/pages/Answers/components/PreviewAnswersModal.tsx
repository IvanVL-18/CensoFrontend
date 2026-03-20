import { ArrowLeft, ChevronLeft, ChevronRight, Save, Calculator, AlertCircle, Loader2, X, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form } from "@formio/react";

import { useFormSchema, useRepeatNavigation, evaluateOperations } from "../hooks/Previewanswersmodal.logic";
import "../../../styles/bootstrap-scoped.css";

const FormAny = Form as any;

/* =========================================================
   ================= NAVIGATION FOOTER =====================
   ========================================================= */

const NavigationFooter = ({
  currentIndex, total, onPrev, onNext, onSave, onBack, isSaving,
}: {
  currentIndex: number; total: number; onPrev: () => void; onNext: () => void;
  onSave?: () => void; onBack: () => void; isSaving?: boolean;
}) => {
  const SaveButton = (
    <button
      onClick={onSave}
      disabled={isSaving}
      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      {isSaving ? "Guardando..." : "Guardar Registro"}
    </button>
  );

  const BackButton = (
    <button
      onClick={onBack}
      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
    >
      <X size={16} /> Volver
    </button>
  );

  if (total <= 1) {
    return (
      <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
        {onSave ? SaveButton : BackButton}
      </div>
    );
  }

  const isLastPage = currentIndex === total - 1;

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg disabled:opacity-40"
      >
        <ChevronLeft size={16} /> Anterior
      </button>
      <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
        {currentIndex + 1} / {total}
      </span>
      {isLastPage ? (
        onSave ? SaveButton : BackButton
      ) : (
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#9B2347] text-white rounded-lg"
        >
          Siguiente <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

/* =========================================================
   ================= COMPONENTE PRINCIPAL ==================
   ========================================================= */

export default function PreviewQuestionPage({
  onSave,
}: {
  onSave?: (submissions: any[]) => void | Promise<void>;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { schema, submissions, setSubmissions, operations, meta, loading, error } =
    useFormSchema(id ?? null);

  const {
    currentIndex, renderTrigger, currentDataRef,
    handleChange, commitAndNavigate, commitCurrent,
  } = useRepeatNavigation(submissions, setSubmissions);

  const [isSaving, setIsSaving]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk]     = useState(false);

  const evaluatedResults = useMemo(() => {
    const live = [...submissions];
    live[currentIndex] = { ...currentDataRef.current };
    return evaluateOperations(operations, live);
  // renderTrigger fuerza re-cálculo cuando Form.io actualiza datos vía ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations, submissions, renderTrigger, currentIndex]);

  // FIX 1: submissionForPage memoizado solo por currentIndex.
  // Sin esto, cada vez que renderTrigger cambia (al escribir), React re-renderiza
  // y pasa un nuevo objeto { data: {} } a Form.io, que lo interpreta como "resetear".
  const submissionForPage = useMemo(
    () => ({ data: submissions[currentIndex] ?? {} }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex]
  );

  // FIX 2: NO navegar al guardar. Mostrar banner de éxito en su lugar.
  // navigate(-1) desmontaba la página y limpiaba la consola del inspector.
  const handleFinish = async () => {
    const finalData = commitCurrent();
    if (onSave) {
      setIsSaving(true);
      setSaveError(null);
      setSavedOk(false);
      try {
        await onSave(finalData);
        setSavedOk(true);                   // ← mostrar banner, NO navegar
      } catch (err: any) {
        setSaveError(err?.message || "Error al guardar. Intenta de nuevo.");
      } finally {
        setIsSaving(false);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#9B2347] text-white px-6 py-4 flex items-center gap-4 shadow-md">
        <button onClick={() => navigate(-1)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold truncate">{meta?.question || "Responder pregunta"}</h1>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 size={32} className="animate-spin text-[#9B2347]" />
            <p className="text-sm font-medium text-gray-400">Cargando maquetación...</p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}
        {saveError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-semibold text-sm">{saveError}</p>
          </div>
        )}
        {savedOk && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-lg">
            <CheckCircle2 size={20} className="shrink-0" />
            <p className="font-semibold text-sm">¡Respuesta guardada correctamente!</p>
          </div>
        )}

        {!loading && schema && !error && (
          <>
            <div className="bs overflow-x-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <FormAny
                  key={`form-${id}-${currentIndex}`}
                  form={schema}
                  submission={submissionForPage}
                  onChange={handleChange}
                  options={{ noAlerts: true, language: "es", noDefaultSubmitButton: true }}
                />
              </div>
            </div>
            {evaluatedResults.length > 0 && (
              <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-sm uppercase">
                  <Calculator size={16} /> Totales Generales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {evaluatedResults.map((op, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                      <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">{op.label}</span>
                      <span className="text-2xl font-black text-blue-700">{op.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!loading && !error && (
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <NavigationFooter
            currentIndex={currentIndex}
            total={submissions.length}
            onPrev={() => commitAndNavigate(-1)}
            onNext={() => commitAndNavigate(1)}
            onSave={onSave ? handleFinish : undefined}
            onBack={() => navigate(-1)}
            isSaving={isSaving}
          />
        </div>
      )}
    </div>
  );
}