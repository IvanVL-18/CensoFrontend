// src/pages/census/censos.service.ts

// ───────────────────────────
// Tipos
// ───────────────────────────

export type Census = {
  id: string;                // viene encriptado desde el backend
  name: string;
  description: string | null;
  init_date: string | null;
  deadline: string | null;
  deleted_at?: string | null;

  // Campos extra para el detalle
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

// ───────────────────────────
// Config base de la API
// ───────────────────────────

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

// ───────────────────────────
// GET /censos/{content}/content
// ───────────────────────────

/**
 * content: 'active' | 'inactive' | 'all'
 */
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

  // Adaptamos lo que venga del backend a nuestro tipo Census
  const data: Census[] = rawData.map((item) => {
    // Por si el resource trae { id, attributes: {...} }
    const attrs = item.attributes ?? item;

    return {
      id: String(item.id ?? attrs.id ?? ""),
      name: String(attrs.name ?? ""),
      description:
        attrs.description !== undefined ? String(attrs.description) : null,

      // intentamos varias claves posibles para las fechas
      init_date:
        attrs.init_date ??
        attrs.initDate ??
        attrs.start_date ??
        attrs.startDate ??
        null,

      deadline:
        attrs.deadline ??
        attrs.end_date ??
        attrs.endDate ??
        attrs.finish_date ??
        null,

      deleted_at:
        attrs.deleted_at !== undefined ? String(attrs.deleted_at) : null,

      // Extras para el detalle (opcionales)
      code:
        attrs.code !== undefined && attrs.code !== null
          ? String(attrs.code)
          : null,

      questions_count:
        attrs.questions_count !== undefined &&
        attrs.questions_count !== null
          ? Number(attrs.questions_count)
          : null,
    };
  });

  const meta = json.meta as PaginationMeta;

  return { data, meta };
}

// ───────────────────────────
// POST /censos  (crear censo)
// ───────────────────────────

export type CreateCensusPayload = {
  name: string;
  description: string;
  init_date: string | null;
  deadline: string | null;
};

export async function createCensus(
  payload: CreateCensusPayload
): Promise<void> {
  const url = `${API_BASE_URL}/censos`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    // creado (201) → todo bien
    return;
  }

  // Errores de validación de Laravel (422)
  if (res.status === 422) {
    const json = await res.json();
    const errors = json.errors ?? {};
    const messages = Object.values(errors).flat() as string[];
    throw { type: "validation", messages };
  }

  // Otros errores
  let message = "Error al crear el censo.";
  try {
    const json = await res.json();
    if (json?.message) message = json.message;
  } catch (_) {
    /* ignore */
  }

  throw { type: "server", messages: [message] };
}
