import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import { saveAnswer, updateAnswer } from "../Answers.service";
import type { CensusQuestion, AnswerData } from "../Answers.types";

interface UseAnswerMutationProps {
  onAnswerSaved: (censusQuestionId: string, answer: AnswerData) => void;
  onClose: () => void;
}

export function useAnswerMutation({ onAnswerSaved, onClose }: UseAnswerMutationProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = useCallback(
    async (question: CensusQuestion, submissionsData: any[]) => {
      setIsSubmitting(true);

      // Un solo submission → enviar el objeto de datos directamente.
      // Múltiples submissions (repeat) → enviar el array completo.
      const answerString =
        submissionsData.length === 1
          ? JSON.stringify(submissionsData[0])
          : JSON.stringify(submissionsData);

      try {
        let result: { message: string; data: AnswerData };

        if (question.answer) {
          result = await updateAnswer(question.answer.id, answerString);
        } else {
          result = await saveAnswer(question.id, answerString);
        }

        addToast(result.message || "Respuesta guardada.", "success");
        onAnswerSaved(question.id, result.data);
        onClose();
      } catch (err: any) {
        const msg = err.message || "Error al guardar la respuesta.";
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, onAnswerSaved, onClose]
  );

  return { isSubmitting, handleSave };
}
