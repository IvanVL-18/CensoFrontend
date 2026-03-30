import { useState, useEffect, useCallback } from "react";
import { getCensusDetail } from "../Answers.service";
import type { CensusDetailResponse, AnswerData } from "../Answers.types";

export function useAnswerCensusDetail(censusId: string | null) {
  const [detail, setDetail] = useState<CensusDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!censusId) {
      setDetail(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getCensusDetail(censusId, controller.signal)
      .then((res) => setDetail(res))
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        setError(err.message || "Error al cargar el censo.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [censusId]);

  // Actualiza la respuesta de una pregunta en el estado local sin recargar toda la estructura
  const updateQuestionAnswer = useCallback(
    (censusQuestionId: string, newAnswer: AnswerData) => {
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((mod) => ({
            ...mod,
            sections: mod.sections.map((sec) => ({
              ...sec,
              questions: sec.questions.map((q) =>
                q.id === censusQuestionId ? { ...q, answer: newAnswer } : q
              ),
            })),
          })),
        };
      });
    },
    []
  );

  return { detail, loading, error, updateQuestionAnswer };
}
