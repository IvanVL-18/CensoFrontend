import { ArrowUpDown, Eye, type LucideProps } from "lucide-react";
import { SearchInput } from "../../../components/SearchInput";
import Pagination from "../../../components/Pagination";
import type { QuestionnaireItem, Links, Meta } from "../dashboard.types";
import Loading from "../../../components/Loading";

const defaultProps = {
  strokeWidth: 1.75,
  size: 22,
};

const IconSort = (props: LucideProps) => (
  <ArrowUpDown {...defaultProps} {...props} />
);
const IconView = (props: LucideProps) => <Eye {...defaultProps} {...props} />;

type Props = {
  title: string;
  searchValue: string;
  onSearchChange: (v: string) => void;

  items: QuestionnaireItem[];
  onView: (id: string) => void;

  meta?: Meta | null;
  links?: Links | null;
  loading?: boolean;
  error?: string | null;
  onPageClick?: (url: string | null) => void;
  onPageNumber?: (page: number) => void;
  baseUrl?: string;

  onSort?: (field: "id" | "name") => void;
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

  onSort,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#7A0C2E] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-white font-semibold text-base">{title}</h2>

        <div className="w-full sm:w-[260px]">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Buscar..."
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                <span>No°</span>
              </th>

              <th className="px-6 py-3 text-left w-full">
                <button
                  type="button"
                  onClick={() => onSort?.("name")}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-opacity-75 transition-colors"
                >
                  <span>Nombre</span>
                  <IconSort size={16} strokeWidth={2.5} />
                </button>
              </th>

              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Opciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={3} className="p-6">
                  <Loading />
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan={3}
                  className="text-center p-6 text-red-600 font-semibold"
                >
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && items.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-6 text-gray-500">
                  No se encontraron Censos.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              items.map((it, index) => (
                <tr key={String(it.id)} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meta ? (meta.from ?? 1) + index : index + 1}
                  </td>

                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    title={it.name}
                  >
                    {it.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                    <button
                      title="Ver"
                      onClick={() => onView(String(it.id))}
                      className="
                        bg-white text-[#691b31]
                        hover:bg-[#9d7e43] hover:text-white
                        active:bg-[#691b31] active:text-white
                        p-2 rounded-lg leading-none transition-colors
                      "
                    >
                      <IconView />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

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
  );
}
