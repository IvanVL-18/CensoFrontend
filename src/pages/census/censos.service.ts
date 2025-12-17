export type Census = {
  id: string; // Viene encriptado desde el backend
  name: string;
  description: string | null;
  init_date: string | null; // Cambié 'start_date' a 'init_date'
  deadline: string | null;  // Cambié 'end_date' a 'deadline'
  deleted_at?: string | null;
  is_active?: boolean; // Este es el estado activo o inactivo
  code?: string | null;
  questions_count?: number | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  total: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

// Función para obtener los censos
export async function getCensuses(
  page: number = 1,
  content: "active" | "inactive" | "all" = "active"
): Promise<{ data: Census[]; meta: PaginationMeta }> {
  const url = `${API_BASE_URL}/censos/${content}/content?page=${page}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error al cargar censos (HTTP ${res.status})`);
  }

  const json = await res.json();
  const rawData: any[] = json.data ?? [];

  const data: Census[] = rawData.map((item) => {
    const attrs = item.attributes ?? item;

    return {
      id: String(item.id ?? attrs.id ?? ""),
      name: String(attrs.name ?? ""),
      description: attrs.description ?? null,
      init_date: attrs.init_date ?? null, // Utilizamos 'init_date' en lugar de 'start_date'
      deadline: attrs.deadline ?? null,  // Utilizamos 'deadline' en lugar de 'end_date'
      deleted_at: attrs.deleted_at ?? null,
      is_active: attrs.is_active ?? true, // Asegúrate de que este campo esté presente
    };
  });

  const meta = json.meta as PaginationMeta;

  return { data, meta };
}

// Función para crear un censo
export type CreateCensusPayload = {
  name: string;
  description: string;
  year?: string | number;
  init_date: string | null;
  deadline: string | null;
  is_active?: boolean; // El estado activo del censo
};

export async function createCensus(
  payload: CreateCensusPayload
): Promise<Census> {
  const url = `${API_BASE_URL}/censos`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      year: payload.year,
      init_date: payload.init_date,
      deadline: payload.deadline,
      is_active: payload.is_active, // Se manda el estado activo si se proporciona
    }),
  });

  if (res.ok) {
    const json = await res.json();
    const raw = json.data ?? json;

    return {
      id: String(raw.id),
      name: String(raw.name ?? payload.name),
      description: raw.description !== undefined ? String(raw.description) : payload.description,
      init_date: raw.init_date ?? raw.start_date ?? payload.init_date,
      deadline: raw.deadline ?? raw.end_date ?? payload.deadline,
      is_active: raw.is_active ?? payload.is_active, // Se incluye el estado activo
    };
  }

  if (res.status === 422) {
    const json = await res.json();
    const errors = json.errors ?? {};
    const messages = Object.values(errors).flat() as string[];
    throw { type: "validation", messages };
  }

  let message = "Error al crear el censo.";
  try {
    const json = await res.json();
    if (json?.message) message = json.message;
  } catch (_) {}

  throw { type: "server", messages: [message] };
}
