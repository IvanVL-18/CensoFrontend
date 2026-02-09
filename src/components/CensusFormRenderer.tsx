import React from 'react';
import { Form } from '@formio/react';

// 👇 SOLUCIÓN DEFINITIVA: 
// Convertimos el componente a 'any' para que TypeScript no exija la propiedad 'src'.
const FormAny = Form as any;

interface CensusFormRendererProps {
  formJson: any; 
  onSubmit?: (submission: any) => void;
}

const CensusFormRenderer: React.FC<CensusFormRendererProps> = ({ formJson, onSubmit }) => {
  
  const handleSubmit = (submission: any) => {
    console.log('Datos capturados:', submission.data);
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
        }}
      />
    </div>
  );
};

export default CensusFormRenderer;