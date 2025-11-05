export type Censo = {
  id: number;
  name: string;
  year: number;
  description?: string;
  startDate?: string; // ISO yyyy-mm-dd
  endDate?: string;   // ISO yyyy-mm-dd
  active?: boolean;
  status?: "Creado" | "Borrador" | "Publicado";
};
