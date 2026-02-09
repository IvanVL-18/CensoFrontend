import { useState, useMemo } from "react";
import { Form } from "@formio/react";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import "formiojs/dist/formio.full.min.css";

// Fix para TypeScript con Form.io
const FormAny = Form as any;

const JSON_DB = {
  // El "formulario" en Form.io es una lista de componentes.
  // Tu archivo componentFormIo.txt es UN componente (tipo 'columns')
  "components": [
    {
      "label": "Columns",
      "columns": [
        {
          "components": [
            {
              "label": "Total",
              "labelPosition": "top",
              "key": "total",
              "type": "number",
              "input": true,
              "disabled": true, // El total suele ser calculado, mejor deshabilitarlo
              "calculateValue": "value = (data['number-1'] || 0) + (data['number-2'] || 0);"
            }
          ],
          "width": 4,
          "offset": 0,
          "push": 0,
          "pull": 0,
          "size": "md",
          "currentWidth": 4
        },
        {
          "components": [
            {
              "label": "Hombres",
              "labelPosition": "top",
              "key": "number-1",
              "type": "number",
              "input": true
            }
          ],
          "width": 4,
          "offset": 0,
          "push": 0,
          "pull": 0,
          "size": "md",
          "currentWidth": 4
        },
        {
          "components": [
            {
              "label": "Mujeres",
              "labelPosition": "top",
              "key": "number-2",
              "type": "number",
              "input": true
            }
          ],
          "width": 4,
          "offset": 0,
          "push": 0,
          "pull": 0,
          "size": "md",
          "currentWidth": 4
        }
      ],
      "key": "columns",
      "type": "columns",
      "input": false,
      "tableView": false
    }
  ],
  // CONFIGURACIÓN DE REPETICIÓN
  "repeat_config": {
    "repeat": true,
    "data_repeat_type": "array",
    "data_repeat_config":
[
  { "value": "4028", "label": "AGENCIA DE DESARROLLO VALLE DE PLATA " },
  { "value": "4081", "label": "AGENCIA ESTATAL DE ENERGIA DE HIDALGO" },
  { "value": "4055", "label": "BACHILLERATO DEL ESTADO DE HIDALGO" },
  { "value": "4082", "label": "CENTRO DE CONCILIACION LABORAL DEL ESTADO DE HIDALGO" },
  { "value": "4070", "label": "CENTRO DE JUSTICIA PARA MUJERES DEL ESTADO DE HIDALGO" },
  { "value": "4014", "label": "CENTRO ESTATAL DE MAQUINARIA PARA EL DESARROLLO" },
  { "value": "4080", "label": "CIUDAD DE LAS MUJERES" },
  { "value": "4054", "label": "COLEGIO DE BACHILLERES DEL ESTADO DE HIDALGO" },
  { "value": "4057", "label": "COLEGIO DE EDUCACION PROFESIONAL TECNICA DEL ESTADO DE HIDALGO" },
  { "value": "4056", "label": "COLEGIO DE ESTUDIOS CIENTIFICOS Y TECNOLOGICOS DEL ESTADO DE HIDALGO" },
  { "value": "4019", "label": "COMISION DE AGUA Y ALCANTARILLADO DE SISTEMAS INTERMUNICIPALES" },
  { "value": "4020", "label": "COMISION DE AGUA Y ALCANTARILLADO DEL SISTEMA VALLE DEL MEZQUITAL" },
  { "value": "4083", "label": "COMISION ESTATAL DE BIODIVERSIDAD DE HIDALGO" },
  { "value": "4016", "label": "COMISION ESTATAL DE VIVIENDA" },
  { "value": "4018", "label": "COMISION ESTATAL DEL AGUA Y ALCANTARILLADO" },
  { "value": "5003", "label": "COMISION ESTATAL PARA EL DESARROLLO SOSTENIBLE DE LOS PUEBLOS INDIGENAS (CEDSPI)" },
  { "value": "5004", "label": "CONSEJO DE CIENCIA, TECNOLOGIA E INNOVACION DE HIDALGO (CITNOVA)" },
  { "value": "5008", "label": "CONSEJO EJECUTIVO DEL COMPLEJO CIENTIFICO Y TECNOLOGICO SINCROTRON EN EL ESTADO DE HIDALGO" },
  { "value": "4034", "label": "CONSEJO ESTATAL PARA LA CULTURA Y LAS ARTES DE HIDALGO" },
  { "value": "5009", "label": "COORDINACION GENERAL DEL DISTRITO DE EDUCACION, SALUD, CIENCIA, TECNOLOGIA E INNOVACION" },
  { "value": "4024", "label": "CORPORACION DE FOMENTO DE INFRAESTRUCTURA INDUSTRIAL" },
  { "value": "4023", "label": "CORPORACION INTERNACIONAL HIDALGO" },
  { "value": "4058", "label": "EL COLEGIO DEL ESTADO DE HIDALGO" },
  { "value": "4059", "label": "ESCUELA DE MUSICA DEL ESTADO DE HIDALGO" },
  { "value": "4005", "label": "INSTITUTO CATASTRAL DEL ESTADO DE HIDALGO" },
  { "value": "4068", "label": "INSTITUTO DE CAPACITACION PARA EL TRABAJO DEL ESTADO DE HIDALGO" },
  { "value": "4021", "label": "INSTITUTO DE VIVIENDA, DESARROLLO URBANO Y ASENTAMIENTOS HUMANOS" },
  { "value": "4063", "label": "INSTITUTO HIDALGUENSE A LA INFRAESTRUCTURA FISICA EDUCATIVA" },
  { "value": "4027", "label": "INSTITUTO HIDALGUENSE DE COMPETITIVIDAD EMPRESARIAL" },
  { "value": "4036", "label": "INSTITUTO HIDALGUENSE DE EDUCACION" },
  { "value": "4038", "label": "INSTITUTO HIDALGUENSE DE EDUCACION PARA ADULTOS" },
  { "value": "4060", "label": "INSTITUTO HIDALGUENSE DE FINANCIAMIENTO A LA EDUCACIN SUPERIOR" },
  { "value": "4008", "label": "INSTITUTO HIDALGUENSE DE LA JUVENTUD" },
  { "value": "4007", "label": "INSTITUTO HIDALGUENSE DE LAS MUJERES" },
  { "value": "4061", "label": "INSTITUTO HIDALGUENSE DEL DEPORTE" },
  { "value": "4003", "label": "INSTITUTO HIDALGUENSE PARA EL DESARROLLO MUNICIPAL" },
  { "value": "4009", "label": "INSTITUTO PARA LA ATENCION DE LAS Y LOS ADULTOS MAYORES DEL ESTADO DE HIDALGO" },
  { "value": "4050", "label": "INSTITUTO TECNOLOGICO SUPERIOR DE HUICHAPAN" },
  { "value": "4051", "label": "INSTITUTO TECNOLOGICO SUPERIOR DE OCCIDENTE DEL ESTADO DE HIDALGO" },
  { "value": "4052", "label": "INSTITUTO TECNOLOGICO SUPERIOR DE ORIENTE DEL ESTADO DE HIDALGO" },
  { "value": "5006", "label": "MUSEO INTERACTIVO PARA LA NIÑEZ Y LA JUVENTUD HIDALGUENSE \"EL REHILETE\"" },
  { "value": "2900", "label": "OFICIALIA MAYOR" },
  { "value": "1000", "label": "OFICINA DEL GOBERNADOR" },
  { "value": "4026", "label": "OPERADORA DE EVENTOS DEL ESTADO DE HIDALGO" },
  { "value": "4069", "label": "POLICIA INDUSTRIAL BANCARIA DEL ESTADO DE HIDALGO" },
  { "value": "3000", "label": "PROCURADURIA GENERAL DE JUSTICIA" },
  { "value": "4001", "label": "RADIO Y TELEVISION DE HIDALGO" },
  { "value": "2000", "label": "SECRETARIA DE CONTRALORIA" },
  { "value": "2700", "label": "SECRETARIA DE CULTURA" },
  { "value": "1800", "label": "SECRETARIA DE DESARROLLO AGROPECUARIO" },
  { "value": "1700", "label": "SECRETARIA DE DESARROLLO ECONOMICO" },
  { "value": "1300", "label": "SECRETARIA DE DESARROLLO SOCIAL" },
  { "value": "2100", "label": "SECRETARIA DE EDUCACION PUBLICA" },
  { "value": "1200", "label": "SECRETARIA DE FINANZAS" },
  { "value": "1100", "label": "SECRETARIA DE GOBIERNO" },
  { "value": "1600", "label": "SECRETARIA DE MEDIO AMBIENTE Y RECURSOS NATURALES" },
  { "value": "2600", "label": "SECRETARIA DE MOVILIDAD Y TRANSPORTE" },
  { "value": "1500", "label": "SECRETARIA DE OBRAS PUBLICAS Y ORDENAMIENTO TERRITORIAL " },
  { "value": "2200", "label": "SECRETARIA DE SALUD" },
  { "value": "2300", "label": "SECRETARIA DE SEGURIDAD PUBLICA" },
  { "value": "1900", "label": "SECRETARIA DE TURISMO" },
  { "value": "2400", "label": "SECRETARIA DEL TRABAJO Y PREVISION SOCIAL" },
  { "value": "5001", "label": "SECRETARIA TECNICA DEL SISTEMA ESTATAL ANTICORRUPCION DE HIDALGO" },
  { "value": "4065", "label": "SERVICIOS DE SALUD DE HIDALGO" },
  { "value": "4071", "label": "SISTEMA DE TRANSPORTE CONVENCIONAL DE HIDALGO" },
  { "value": "4072", "label": "SISTEMA INTEGRADO DE TRANSPORTE MASIVO DE HIDALGO" },
  { "value": "5002", "label": "SISTEMA PARA EL DESARROLLO INTEGRAL DE LA FAMILIA DEL ESTADO DE HIDALGO" },
  { "value": "2800", "label": "UNIDA DE PLANEACION Y PROSPECTIVA" },
  { "value": "4084", "label": "UNIVERSIDAD DIGITAL DEL ESTADO DE HIDALGO" },
  { "value": "4053", "label": "UNIVERSIDAD INTERCULTURAL DEL ESTADO DE HIDALGO" },
  { "value": "4041", "label": "UNIVERSIDAD POLITECNICA DE FRANSCICO I MADERO" },
  { "value": "4042", "label": "UNIVERSIDAD POLITECNICA DE HUEJUTLA" },
  { "value": "4077", "label": "UNIVERSIDAD POLITECNICA DE LA ENERGIA" },
  { "value": "4040", "label": "UNIVERSIDAD POLITECNICA DE PACHUCA" },
  { "value": "4039", "label": "UNIVERSIDAD POLITECNICA DE TULANCINGO" },
  { "value": "4043", "label": "UNIVERSIDAD POLITECNICA METROPOLITANA DE HIDALGO" },
  { "value": "4046", "label": "UNIVERSIDAD TECNOLOGICA DE LA HUASTECA HIDALGUENSE" },
  { "value": "4048", "label": "UNIVERSIDAD TECNOLOGICA DE LA SIERRA HIDALGUENSE" },
  { "value": "4049", "label": "UNIVERSIDAD TECNOLOGICA DE LA ZONA METROPOLITANA DEL VALLE DE MEXICO" },
  { "value": "4076", "label": "UNIVERSIDAD TECNOLOGICA DE MINERAL DE LA REFORMA" },
  { "value": "4044", "label": "UNIVERSIDAD TECNOLOGICA DE TULA-TEPEJI" },
  { "value": "4045", "label": "UNIVERSIDAD TECNOLOGICA DE TULANCINGO" },
  { "value": "4047", "label": "UNIVERSIDAD TECNOLOGICA DEL VALLE DEL MEZQUITAL" },
  { "value": "4073", "label": "UNIVERSIDAD TECNOLOGICA MINERA DE ZIMAPAN" }
]
  }
};

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onDismiss={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}

const UniversalViewer = ({ jsonSchema }: { jsonSchema: any }) => {
  const { addToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<string, any>>({});
  const [currentBuffer, setCurrentBuffer] = useState<any>(null);

  const items = useMemo(() => {
    return jsonSchema.repeat_config?.data_repeat_config || [];
  }, [jsonSchema]);

  const currentInstitution = items[currentIndex];
  const totalItems = items.length;

  const submissionData = useMemo(() => {
    if (!currentInstitution) return null;
    const existingData = allAnswers[currentInstitution.value];
    return {
      data: existingData || {
        label: currentInstitution.label, 
        "number-1": 0, "number-2": 0, total: 0
      }
    };
  }, [currentInstitution, allAnswers]);

  const onFormChange = (submission: any) => {
    if (submission && submission.data) {
      setCurrentBuffer(submission.data);
    }
  };

  const saveCurrentData = () => {
    const dataToSave = currentBuffer || submissionData?.data;
    setAllAnswers(prev => ({
      ...prev,
      [currentInstitution.value]: dataToSave
    }));
    return dataToSave;
  };

  const handlePrev = () => {
    saveCurrentData();
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setCurrentBuffer(null);
  };

  const handleNext = () => {
    saveCurrentData();
    setCurrentIndex(prev => Math.min(totalItems - 1, prev + 1));
    setCurrentBuffer(null);
  };

  const handleFinalize = () => {
    saveCurrentData();
    console.log("ENVÍO FINAL:", allAnswers);
    addToast("¡Censo completado y enviado exitosamente!", "success");
  };

  if (items.length === 0) return <div>Cargando...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto shadow-xl rounded-lg overflow-hidden bg-white border border-gray-200">
      
      {/* 1. HEADER COMPACTO */}
      <div className="bg-white border-b border-gray-100 p-5 pb-0">
        <div className="flex justify-between items-start mb-2">
            <div>
                 <span className="inline-block py-0.5 px-2 mb-1 rounded bg-gray-100 text-gray-500 text-[10px] font-bold tracking-wider uppercase">
                    ID: {currentInstitution?.value}
                 </span>
                 <h2 className="text-xl font-bold text-gray-800 leading-tight">
                   {currentInstitution?.label}
                 </h2>
            </div>
            <div className="flex flex-col items-end pl-4">
                <span className="text-2xl font-bold text-[#691B31]">{currentIndex + 1}</span>
                <span className="text-gray-400 text-xs font-medium">de {totalItems}</span>
            </div>
        </div>

        {/* Barra de progreso sutil pegada al borde */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3">
          <div 
            className="bg-[#691B31] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* 2. CUERPO DE CONTENIDO (Padding reducido y ajustado) */}
      <div className="px-6 py-4">
        {/* Aquí va el formulario. Form.io ya agrega sus propios márgenes, 
            así que reducimos el padding vertical del contenedor padre */}
        <FormAny
            key={currentIndex} 
            form={jsonSchema}
            submission={submissionData}
            onChange={onFormChange}
            options={{ noAlerts: true, hide: { submit: true } }}
        />
      </div>

      {/* 3. FOOTER DE NAVEGACIÓN (BOTONES ABAJO) */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        
           {/* Botón Anterior */}
           <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentIndex === 0 
                  ? "text-gray-300 cursor-not-allowed" 
                  : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Anterior
            </button>

            {/* Botón Siguiente / Finalizar */}
            {currentIndex < totalItems - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#691B31] text-white rounded shadow-sm hover:shadow hover:bg-opacity-90 font-medium transition-all text-sm"
              >
                Guardar y Siguiente
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleFinalize}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded shadow-sm hover:shadow hover:bg-green-700 font-bold transition-all text-sm"
              >
                ✓ Finalizar Censo
              </button>
            )}
      </div>

    </div>
  );
};

export default function CensusQuestionsPage() {
  return (
    <ToastProvider>
      {/* Centrado vertical y fondo limpio */}
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <ToastContainer />
        <UniversalViewer jsonSchema={JSON_DB} />
      </div>
    </ToastProvider>
  );
}