import { useState, useEffect } from "react";
// Ya no necesitamos importar { Form } de @formio/react aquí directamente
import "formiojs/dist/formio.full.min.css"; 

// Importamos tu componente reutilizable
import CensusFormRenderer from "../../components/CensusFormRenderer";

// Importamos servicios y tipos
import { getQuestionsRender } from "./formio.service";
import type { QuestionData } from "./formio.types";

const CensusQuestionsPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Función para limpiar la paginación del JSON
  const forceFormDisplay = (structure: any) => {
    if (!structure) return structure;
    // Creamos una copia profunda para evitar mutar el estado directamente si fuera necesario
    const fixedStructure = JSON.parse(JSON.stringify(structure));
    fixedStructure.display = 'form';
    return fixedStructure;
  };

  const fetchQuestionData = async (pageNumber: number) => {
    setLoading(true);
    setShowInstructions(false); 
    
    try {
      const response = await getQuestionsRender(pageNumber);
      
      if (response.data && response.data.length > 0) {
        const question = response.data[0];
        
        if (question.question_structure) {
            question.question_structure = forceFormDisplay(question.question_structure);
        }

        setCurrentQuestion(question);
      } else {
        setCurrentQuestion(null);
      }

      setTotalPages(response.last_page);
      setPage(response.current_page);

    } catch (error) {
      console.error("Error al obtener la pregunta:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionData(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#691B31]">
              Visualizador de Componentes
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Registro {page} de {totalPages}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={handlePrev}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages || loading}
              className="px-4 py-2 bg-[#691B31] text-white border border-transparent rounded shadow-sm hover:bg-[#591628] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </header>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#691B31] border-t-transparent mb-3"></div>
            <p className="text-gray-400 font-medium">Cargando estructura...</p>
          </div>
        ) : currentQuestion ? (
          <div className="space-y-6">
            
            {/* Detalles Informativos */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-[#BC955C]">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                  {currentQuestion.name}
                </h2>
                <span className="ml-4 bg-gray-100 text-gray-500 text-xs font-mono px-2 py-1 rounded">
                  ID: {currentQuestion.id}
                </span>
              </div>

              {currentQuestion.instructions && (
                <div className="mt-4">
                  <button 
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="flex items-center gap-2 text-sm font-bold text-[#691B31] hover:text-[#9c3e59] transition-colors focus:outline-none"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transform transition-transform duration-200 ${showInstructions ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    
                    {showInstructions ? "Ocultar Instrucciones" : "Ver Instrucciones"}
                  </button>

                  {showInstructions && (
                    <div className="mt-3 bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fade-in-down">
                        <div 
                            className="text-sm text-blue-900 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: currentQuestion.instructions.replace(/\n/g, '<br/>') }} 
                        />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Formulario Form.io Renderizado con el Componente Reutilizable */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Vista Previa</h3>
              </div>
              
              <div className="formio-clean-render">
                {/* 👇 AQUÍ USAMOS TU COMPONENTE CORRECTAMENTE */}
                <CensusFormRenderer 
                  formJson={currentQuestion.question_structure} 
                  onSubmit={(data: any) => console.log("Simulación:", data)}
                  readOnly={false}
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500 text-lg">No se encontraron datos.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CensusQuestionsPage;