// Operación matemática dentro del schema
export interface Operation {
  label: string;
  expression: string;
}

// Configuración de repetición de la pregunta
export interface RepeatConfig {
  repeat: boolean;
  data_repeat_type: 'array' | 'fixed';
  data_repeat_config: Record<string, unknown>[];
  data_repeat_url_false: string;
  data_repeat_number: number | null;
}

// Schema completo de form.io + propiedades custom
export interface FormSchema {
  display?: string;
  components: unknown[];
  repeat_config?: RepeatConfig;
  operations?: Operation[];
}

// Respuesta del endpoint GET /questions/:id/getForm
export interface QuestionResponse {
  json_schema: FormSchema | null;
  name: string;
  instructions: string | null;
  commentaries: boolean;
}

// Respuesta del endpoint POST /questions/:id/saveForm
export interface SaveFormResponse {
  message: string;
}
