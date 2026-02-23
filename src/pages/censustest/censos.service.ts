// src/pages/census/censos.service.ts
import type {
  Census,
  PaginationMeta,
  CreateCensusPayload,
  ContentFilter,
} from "./census.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

// Función para obtener los censos
export async function getCensuses(
  page: number = 1,
  content: ContentFilter = "active"
): Promise<{ data: Census[]; meta: PaginationMeta; links: PaginationLinks | null }> {
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
      init_date: attrs.init_date ?? null,
      deadline: attrs.deadline ?? null,
      deleted_at: attrs.deleted_at ?? null,
      is_active: attrs.is_active ?? true,
      code: attrs.code ?? null,
      questions_count: attrs.questions_count ?? null,
    };
  });

  const meta = json.meta as PaginationMeta;

  // ✅ LINKS: tolerante a varios formatos
  // Laravel: json.links {first,last,prev,next}
  // A veces: json.meta.links {first,last,prev,next}
  const linksRaw = (json.links ?? json?.meta?.links) as any;

  const links: PaginationLinks | null = linksRaw
    ? {
        first: linksRaw.first ?? null,
        last: linksRaw.last ?? null,
        prev: linksRaw.prev ?? null,
        next: linksRaw.next ?? null,
      }
    : null;

  return { data, meta, links };
}

// Función para crear un censo
export async function createCensus(payload: CreateCensusPayload): Promise<Census> {
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
      is_active: payload.is_active,
    }),
  });

  if (res.ok) {
    const json = await res.json();
    const raw = json.data ?? json;

    return {
      id: String(raw.id),
      name: String(raw.name ?? payload.name),
      description:
        raw.description !== undefined
          ? String(raw.description)
          : payload.description,
      init_date: raw.init_date ?? raw.start_date ?? payload.init_date,
      deadline: raw.deadline ?? raw.end_date ?? payload.deadline,
      is_active: raw.is_active ?? payload.is_active,
      code: raw.code ?? null,
      questions_count: raw.questions_count ?? null,
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
