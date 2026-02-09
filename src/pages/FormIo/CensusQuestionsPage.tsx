import React, { useState, useEffect, useMemo } from 'react';
import { Form } from '@formio/react';
import { ToastProvider, useToast } from '../../context/ToastContext'; // Asegúrate de que esta ruta sea correcta
import { Toast } from '../../components/Toast'; // Asegúrate de que esta ruta sea correcta
import 'formiojs/dist/formio.full.min.css';

// Solución para TypeScript
const FormAny = Form as any;

// ==========================================
// 1. TU JSON CRUDO (Limpié las comillas extra para que sea JS válido)
// ==========================================
const JSON_CENSO_RAW = {
  "components": [
    {
      "label": "HTML",
      "tag": "p",
      "className": "fw-bold text-center text-xl text-[#691B31] font-bold mb-4",
      "content": "Personal adscrito a las instituciones de la Administración Pública de la entidad federativa, según sexo",
      "key": "html",
      "type": "htmlelement"
    },
    {
      "label": "Nombre de las instituciones",
      "labelPosition": "top",
      "disabled": true, 
      "tableView": true,
      "key": "label", 
      "type": "textfield",
      "input": true
    },
    {
      "label": "Columns",
      "columns": [
        {
          "components": [
            {
              "label": "Total",
              "disabled": true,
              "calculateValue": "value = (data['number-1'] || 0) + (data['number-2'] || 0);",
              "key": "total",
              "type": "number",
              "input": true
            }
          ],
          "width": 4,
          "currentWidth": 4
        },
        {
          "components": [
            {
              "label": "Hombres",
              "key": "number-1",
              "type": "number",
              "input": true
            }
          ],
          "width": 4,
          "currentWidth": 4
        },
        {
          "components": [
            {
              "label": "Mujeres",
              "key": "number-2",
              "type": "number",
              "input": true
            }
          ],
          "width": 4,
          "currentWidth": 4
        }
      ],
      "key": "columns",
      "type": "columns",
      "input": false
    },
    {
      "type": "button",
      "label": "Guardar y Siguiente",
      "key": "submit",
      "disableOnInvalid: true": true,
      "input": true,
      "tableView": false,
      "className": "bg-[#691B31] text-white w-full mt-6 p-3 rounded shadow hover:bg-[#501525]"
    }
  ],
  "repeat_config": {
    "repeat": true,
    "data_repeat_type": "array",
    "data_repeat_config": [
      { "value": "2900", "label": "OFICIALIA MAYOR" },
      { "value": "1000", "label": "OFICINA DEL GOBERNADOR" },
      { "value": "3000", "label": "PROCURADURIA GENERAL DE JUSTICIA" },
      { "value": "2000", "label": "SECRETARIA DE CONTRALORIA" },
      { "value": "2700", "label": "SECRETARIA DE CULTURA" },
      { "value": "1800", "label": "SECRETARIA DE DESARROLLO AGROPECUARIO" },
      { "value": "4045", "label": "UNIVERSIDAD TECNOLOGICA DE TULANCINGO" }
      // ... El resto de tus 70 items funcionarán aquí automáticamente
    ]
  }
};

// ==========================================
// 2. Componente Toasts (Auxiliar)
// ==========================================
function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

// ==========================================
// 3. MOTOR UNIVERSAL DE PAGINACIÓN (La lógica)
// ==========================================
const UniversalViewer = ({ jsonSchema }: { jsonSchema: any }) => {
  const { addToast } = useToast();
  
  // Estados
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submissionData, setSubmissionData] = useState<{ data: any } | null>(null);

  // Extraer configuración
  const items = useMemo(() => {
    return jsonSchema.repeat_config?.data_repeat_config || [];
  }, [jsonSchema]);
  
  const totalItems = items.length;
  const currentItem = items[currentIndex];

  // Efecto: Preparar el formulario cada vez que cambiamos de institución
  useEffect(() => {
    if (currentItem) {
      // Inyectamos el label automáticamente
      setSubmissionData({
        data: {
          label: currentItem.label, // Esto llena el input "Nombre de las instituciones"
          // Form.io limpiará el resto porque usamos key={currentIndex} abajo
        }
      });
    }
  }, [currentIndex, currentItem]);

  // Manejador al dar click en "Guardar"
  const handleNext = (submission: any) => {
    const dataCapturada = submission.data;
    
    // AQUÍ SIMULAMOS EL GUARDADO (Log en consola)
    console.log(`✅ GUARDADO LOCAL [${currentIndex + 1}/${totalItems}]:`, {
      institucion: currentItem.label,
      hombres: dataCapturada['number-1'],
      mujeres: dataCapturada['number-2'],
      total: dataCapturada.total
    });

    addToast(`Guardado: ${currentItem.label}`, 'success');

    // Lógica para avanzar
    if (currentIndex < totalItems - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      }, 300); // Pequeña pausa para ver el efecto
    } else {
      setIsFinished(true);
      addToast("¡Has terminado todo el censo!", "success");
    }
  };

  if (isFinished) {
    return (
      <div className="text-center p-10 bg-white rounded-xl shadow border border-green-200">
        <h2 className="text-3xl text-green-700 font-bold mb-4">¡Proceso Finalizado!</h2>
        <p className="text-gray-600">Has capturado todas las instituciones del JSON.</p>
        <button 
          onClick={() => { setIsFinished(false); setCurrentIndex(0); }}
          className="mt-6 px-6 py-2 bg-[#691B31] text-white rounded hover:opacity-90"
        >
          Reiniciar Prueba
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Barra de Progreso */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-4 z-10">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Institución Actual</span>
            <h2 className="text-lg font-bold text-[#691B31] leading-tight">
              {currentItem?.label}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-700">{currentIndex + 1}</span>
            <span className="text-gray-400 text-sm"> / {totalItems}</span>
          </div>
        </div>
        {/* Línea de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
          <div 
            className="bg-[#691B31] h-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        {submissionData && (
          // key={currentIndex} es VITAL: obliga a React a reiniciar el form en cada paso
          // para que los números se pongan en cero pero el nombre de la institución cambie.
          <FormAny 
            key={currentIndex} 
            form={jsonSchema} 
            submission={submissionData}
            onSubmit={handleNext}
            options={{ noAlerts: true }}
          />
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. PÁGINA PRINCIPAL
// ==========================================
export default function CensusQuestionsPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center">
        <ToastContainer />
        
        <h1 className="text-3xl font-bold text-[#691B31] mb-2">Visor de Censo</h1>
        <p className="text-gray-500 mb-8">Modo de prueba local con JSON estático</p>

        {/* Aquí pasas tu JSON y listo */}
        <UniversalViewer jsonSchema={JSON_CENSO_RAW} />
        
      </div>
    </ToastProvider>
  );
}
