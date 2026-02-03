import type { Section, PaginationMeta, ContentFilter } from "./census.interfaces";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getSections(
  page: number = 1,
  content: ContentFilter = "active"
): Promise<{ data: Section[]; meta: PaginationMeta }> {
  const url = `${API_BASE_URL}/sections/${content}/content?page=${page}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error al cargar secciones (HTTP ${res.status})`);
  }

  const json = await res.json();
  const rawData: any[] = json.data ?? [];

  const data: Section[] = rawData.map((item) => {
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
