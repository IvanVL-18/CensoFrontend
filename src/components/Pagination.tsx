// src/components/Pagination.tsx
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MetaLike = {
  current_page: number | number[];
  last_page: number | number[];
};

type LinksObj = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

type Props = {
  meta: MetaLike | null;
  links?: LinksObj | null;

  loading?: boolean;
  error?: string | null;

  onPageClick?: (url: string | null) => void;
  onPageNumber?: (page: number) => void;
  baseUrl?: string;

  className?: string;
};

function toNumber(v: number | number[] | null | undefined, fallback = 1) {
  if (Array.isArray(v)) return typeof v[0] === "number" ? v[0] : fallback;
  if (typeof v === "number") return v;
  return fallback;
}

function buildUrlWithPage(baseUrl: string, page: number): string {
  try {
    const u = new URL(baseUrl);
    u.searchParams.set("page", String(page));
    return u.toString();
  } catch {
    const cleaned = baseUrl
      .replace(/([?&])page=\d+/, "$1")
      .replace(/[?&]$/, "");
    const sep = cleaned.includes("?") ? "&" : "?";
    return `${cleaned}${sep}page=${page}`;
  }
}

export default function Pagination({
  meta,
  links = null,
  loading = false,
  error = null,
  onPageClick,
  onPageNumber,
  baseUrl,
  className,
}: Props) {
  if (!meta) return null;

  const current = toNumber(meta.current_page, 1);
  const last = toNumber(meta.last_page, 1);

  const hasPrev = !!links?.prev;
  const hasNext = !!links?.next;

  const canGoPrev = !loading && current > 1 && (hasPrev || last > 1);
  const canGoNext = !loading && current < last && (hasNext || last > 1);

  const emitPage = (page: number) => {
    if (page < 1 || page > last) return;

    // Preferimos navegación por URL (Laravel links)
    if (onPageClick) {
      const base =
        links?.first ?? links?.next ?? links?.prev ?? links?.last ?? baseUrl;

      if (base) return onPageClick(buildUrlWithPage(base, page));
    }

    // Fallback por número
    if (onPageNumber) return onPageNumber(page);
  };

  const emitPrev = () => {
    if (!canGoPrev) return;
    if (onPageClick && links?.prev) return onPageClick(links.prev);
    emitPage(current - 1);
  };

  const emitNext = () => {
    if (!canGoNext) return;
    if (onPageClick && links?.next) return onPageClick(links.next);
    emitPage(current + 1);
  };

  return (
    <div className={clsx("w-full", className)}>
      {error && <p className="mb-2 text-xs text-red-600 text-center">{error}</p>}

      <div className="flex justify-center">
        <div
          className="
            inline-flex items-center gap-2
            rounded-xl border border-gray-200 bg-white
            shadow-sm
            px-2 py-2
          "
        >
          {/* Prev */}
          <button
            type="button"
            onClick={emitPrev}
            disabled={!canGoPrev}
            className={clsx(
              `
              h-9 w-9 rounded-lg
              grid place-items-center
              border border-gray-200
              bg-white
              transition
              `,
              !canGoPrev
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-50 active:scale-[0.98]"
            )}
            title="Anterior"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          {/* Número actual (como tu imagen) */}
          <div
            className="
              h-9 min-w-9 px-3
              rounded-lg
              border border-gray-200
              bg-white
              grid place-items-center
              text-sm font-medium text-gray-800
              select-none
            "
            title={`Página ${current} de ${last}`}
          >
            {current}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={emitNext}
            disabled={!canGoNext}
            className={clsx(
              `
              h-9 w-9 rounded-lg
              grid place-items-center
              border border-gray-200
              bg-white
              transition
              `,
              !canGoNext
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-50 active:scale-[0.98]"
            )}
            title="Siguiente"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Texto opcional (si quieres, puedes borrarlo) */}
      <p className="mt-2 text-[12px] text-center text-gray-500">
        Página <span className="font-semibold">{current}</span> de{" "}
        <span className="font-semibold">{last}</span>
      </p>
    </div>
  );
}
