import { useState, useCallback } from "react";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import { useAnswersCensuses } from "./hooks/useAnswersCensuses";
import { useAnswerCensusDetail } from "./hooks/useAnswerCensusDetail";
import { CensusList } from "./components/CensusList";
import { CensusDetail } from "./components/CensusDetail";
import { AnswerModal } from "./components/AnswerModal";
import type { MyCensus, CensusQuestion, AnswerData } from "./Answers.types";

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

function AnswersPageContent() {
  const [selectedCensus, setSelectedCensus] = useState<MyCensus | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<CensusQuestion | null>(null);

  const {
    censuses,
    loading: censusesLoading,
    error: censusesError,
  } = useAnswersCensuses();

  const {
    detail,
    loading: detailLoading,
    error: detailError,
    updateQuestionAnswer,
  } = useAnswerCensusDetail(selectedCensus?.id ?? null);

  const handleSelectCensus = useCallback((census: MyCensus) => {
    setSelectedCensus(census);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCensus(null);
  }, []);

  const handleOpenQuestion = useCallback((question: CensusQuestion) => {
    setActiveQuestion(question);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveQuestion(null);
  }, []);

  const handleAnswerSaved = useCallback(
    (censusQuestionId: string, answer: AnswerData) => {
      updateQuestionAnswer(censusQuestionId, answer);
    },
    [updateQuestionAnswer]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      {/* Toolbar */}
      <div className="flex items-center p-4 bg-[var(--pantone-7421)]">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          {selectedCensus ? selectedCensus.name : "Mis Censos"}
        </h1>
      </div>

      <div className="p-6">
        {!selectedCensus ? (
          <CensusList
            censuses={censuses}
            loading={censusesLoading}
            error={censusesError}
            onSelect={handleSelectCensus}
          />
        ) : (
          <CensusDetail
            detail={detail}
            loading={detailLoading}
            error={detailError}
            onBack={handleBack}
            onOpenQuestion={handleOpenQuestion}
          />
        )}
      </div>

      <AnswerModal
        isOpen={activeQuestion !== null}
        question={activeQuestion}
        onClose={handleCloseModal}
        onAnswerSaved={handleAnswerSaved}
      />
    </div>
  );
}

export default function Answers() {
  return (
    <ToastProvider>
      <AnswersPageContent />
    </ToastProvider>
  );
}
