export type Institution = {
  id: number;
  nombre: string;
  geocodigo?: string | null;
  municipio: string;
  tipo: string;
  mostrar: boolean;
};

export type SortKey = "nombre" | "municipio" | "tipo";
export type SortDir = "asc" | "desc";
