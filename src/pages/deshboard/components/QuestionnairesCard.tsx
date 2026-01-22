import { Eye } from "lucide-react";
import { SearchInput } from "../../../components/SearchInput";
import Pagination from "../../../components/Pagination"; 
import type { QuestionnaireItem } from "../dashboard.types";

// ✅ tipos de paginación compatibles con tu Pagination
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
  title: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  items: QuestionnaireItem[];
  onView: (id: string) => void;

  // ✅ nuevos props para paginación
  meta?: MetaLike | null;
  links?: LinksObj | null;
  loading?: boolean;
  error?: string | null;
  onPageClick?: (url: string | null) => void;

  // (si paginaras por número en lugar de URL)
  onPageNumber?: (page: number) => void;
  baseUrl?: string;
};

export default function QuestionnairesCard({
  title,
  searchValue,
  onSearchChange,
  items,
  onView,

  meta = null,
  links = null,
  loading = false,
  error = null,
  onPageClick,
  onPageNumber,
  baseUrl,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#7A0C2E] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-white font-semibold text-sm">{title}</h2>

        <div className="w-full sm:w-[260px]">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Buscar..."
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[70px_1fr_110px] px-4 py-3 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
            <div>#</div>
            <div className="flex items-center gap-2">
              <span>Nombre</span>
              <span className="text-slate-400">↑↓</span>
            </div>
            <div className="text-right">Acción</div>
          </div>

          <div className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-900">
                  No hay resultados
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Intenta con otro término.
                </p>
              </div>
            ) : (
              items.map((it, idx) => (
                <div
                  key={it.id}
                  className="grid grid-cols-[70px_1fr_110px] items-center px-4 py-3 hover:bg-slate-50 transition"
                >
                  <div className="text-sm text-slate-700 font-semibold">
                    {idx + 1}
                  </div>

                  <div
                    className="text-sm text-slate-800 truncate"
                    title={it.name}
                  >
                    {it.name}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onView(it.id)}
                      className="h-9 w-9 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-white transition flex items-center justify-center"
                      title="Ver"
                    >
                      <Eye className="h-4 w-4 text-[#B08B57]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ✅ Pagination (solo si meta existe) */}
          {meta && (
            <div className="mt-4 pb-4 flex justify-center">
              <Pagination
                meta={meta}
                links={links}
                loading={loading}
                error={error}
                onPageClick={onPageClick}
                onPageNumber={onPageNumber}
                baseUrl={baseUrl}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
