import PreviewquestionPage from "./components/PreviewAnswersModal";
import { ToastProvider } from "../../context/ToastContext";
import { saveAnswer } from "./Answers.service"; // Verifica la ruta correcta

function AnswersPageContent() {
  const handleSave = async (submissions: any[]) => {
    try {
      // Si la pregunta no tiene repeat, submissions tiene 1 elemento → mandamos el objeto directamente.
      // Si tiene repeat, mandamos el array completo para que el backend lo serialice.
      const payload = submissions.length === 1 ? submissions[0] : submissions;
        console.log("🟡 PAYLOAD QUE SE ENVÍA:", JSON.stringify(payload, null, 2));
      await saveAnswer(payload);
      alert("¡Respuesta guardada correctamente en la base de datos!");
    } catch (error) {
      console.error("Error al guardar la respuesta:", error);
      alert("Hubo un error al intentar guardar.");
    }
  };

  // Al pasarle onSave, el PreviewAnswersModal automáticamente habilita el botón verde
  return <PreviewquestionPage onSave={handleSave} />;
}

export default function Answers() {
  return (
    <ToastProvider>
      <AnswersPageContent />
    </ToastProvider>
  );
}