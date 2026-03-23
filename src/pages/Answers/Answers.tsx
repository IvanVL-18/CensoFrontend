import PreviewquestionPage from "./components/PreviewAnswersModal";
import { ToastProvider } from "../../context/ToastContext";
import { saveAnswer } from "./Answers.service";
import { useParams } from "react-router-dom"; // ← agregar

function AnswersPageContent() {
  const { id } = useParams<{ id: string }>(); // ← mismo id del URL que usa PreviewAnswersModal

  const handleSave = async (submissions: any[]) => {
    try {
      if (!id) throw new Error("No se encontró el id de la pregunta.");

      // Sin repeat → submissions tiene 1 elemento → mandamos el objeto directamente
      // Con repeat  → mandamos el array completo
      const answer = submissions.length === 1 ? submissions[0] : submissions;

      console.log("🟡 PAYLOAD QUE SE ENVÍA:", JSON.stringify({ census_question_id: id, answer }, null, 2));

      await saveAnswer(id, answer); // ← pasamos id separado
      alert("¡Respuesta guardada correctamente en la base de datos!");
    } catch (error) {
      console.error("Error al guardar la respuesta:", error);
      alert("Hubo un error al intentar guardar.");
    }
  };

  return <PreviewquestionPage onSave={handleSave} />;
}

export default function Answers() {
  return (
    <ToastProvider>
      <AnswersPageContent />
    </ToastProvider>
  );
}