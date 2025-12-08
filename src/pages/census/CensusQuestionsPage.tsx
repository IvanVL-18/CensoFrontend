// src/pages/census/CensusQuestionsPage.tsx
import { useLocation, useNavigate } from "react-router-dom";

export default function CensusQuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromFlow = location.state ?? null;

  const handleBack = () => {
    navigate("/censos/secciones");
  };

  return (
    <div className="space-y-4">
      <header className="bg-[var(--pantone-7421)] text-white rounded-xl px-4 py-3">
        <h1 className="text-lg font-semibold">Preguntas del censo</h1>
        <p className="text-xs mt-1 text-white/80">
          (Placeholder) Aquí después diseñamos la pantalla para configurar las preguntas.
        </p>
      </header>

      <div className="bg-white rounded-2xl shadow-md p-6 text-sm text-gray-700">
        <p className="mb-3">
          De momento esta pantalla solo es un marcador de posición.
        </p>
        <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto">
          {JSON.stringify(fromFlow, null, 2)}
        </pre>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleBack}
            className="
              inline-flex items-center justify-center
              px-5 py-1.5 rounded-xl text-sm font-medium
              bg-[#DDC9A3] text-[#691B31]
              border border-[#DDC9A3]
              hover:bg-[#E0CEAA] hover:border-[#E0CEAA]
              hover:shadow-md active:scale-[0.97]
              transition-all duration-200
            "
          >
            Regresar a secciones
          </button>
        </div>
      </div>
    </div>
  );
}
