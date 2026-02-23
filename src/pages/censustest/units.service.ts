// src/pages/census/units.service.ts
import type { Unit, PaginationMeta, ContentFilter } from "../census.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

/**
 * GET /units/{content}/content
 * content: 'active' | 'inactive' | 'all'
 */
export async function getUnits(
  page: number = 1,
  content: ContentFilter = "active"
): Promise<{ data: Unit[]; meta: PaginationMeta }> {
  const url = `${API_BASE_URL}/units/${content}/content?page=${page}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error al cargar unidades (HTTP ${res.status})`);
  }

  const json = await res.json();
  const rawData: any[] = json.data ?? [];

  const data: Unit[] = rawData.map((item) => {
    const attrs = item.attributes ?? item;

    return {
      id: attrs.id ?? item.id,
      name: attrs.name ?? "",
      key: attrs.key ?? attrs.clave ?? null,
      ...attrs,
    };
  });

  const meta = json.meta as PaginationMeta;

  return { data, meta };
}
