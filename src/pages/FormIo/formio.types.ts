// src/pages/FormIo/formio.types.ts

export interface FormIoStructure {
    components: any[];
    display?: string;
    // Agregamos cualquier otra propiedad que venga en el JSON de structure
    [key: string]: any; 
}

export interface QuestionData {
    id: number;
    name: string;
    instructions: string | null;
    // Aquí recibimos el objeto ya parseado desde Laravel
    question_structure: FormIoStructure; 
}

export interface ApiPaginationResponse {
    current_page: number;
    data: QuestionData[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}