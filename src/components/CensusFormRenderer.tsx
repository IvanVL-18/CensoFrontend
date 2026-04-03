import React from 'react';
import { Form } from '@formio/react';

// 👇 SOLUCIÓN DEFINITIVA: 
// Convertimos el componente a 'any' para que TypeScript no exija la propiedad 'src'.
const FormAny = Form as any;

interface CensusFormRendererProps {
  formJson: any; 
  onSubmit?: (submission: any) => void;
  // 👇 AGREGAMOS ESTO: Definimos que el componente acepta la propiedad opcional readOnly
  readOnly?: boolean;
}

// 👇 Recibimos readOnly con un valor por defecto de false
const CensusFormRenderer: React.FC<CensusFormRendererProps> = ({ formJson, onSubmit, readOnly = false }) => {
  
  const handleSubmit = (submission: any) => {
    if (onSubmit) {
      onSubmit(submission);
    }
  };

  if (!formJson) {
    return <div className="text-center p-4">Cargando formulario...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      {/* Usamos 'FormAny' en lugar de 'Form' */}
      <FormAny 
        form={formJson} 
        onSubmit={handleSubmit}
        options={{
            noAlerts: true,
            // 👇 PASAMOS EL VALOR A LAS OPCIONES DE FORM.IO
            readOnly: readOnly, 
        }}
      />
    </div>
  );
};

export default CensusFormRenderer;