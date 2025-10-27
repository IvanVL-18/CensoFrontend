import SearchBar from "../../../components/ui/common/SearchBar";

type Props = {
  title?: string;
  query: string;
  onQueryChange: (v: string) => void;
  onNewClick?: () => void;
};

export default function InstitutionsHeader({
  title = "Instituciones",
  query,
  onQueryChange,
  onNewClick,
}: Props) {
  return (
    <div className="rounded-t-xl bg-[#5b1d27] px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-white font-semibold text-lg tracking-wide">{title}</h2>
        <div className="flex items-center gap-3">
          <SearchBar value={query} onChange={onQueryChange} placeholder="Buscar..." />
          {onNewClick && (
            <button
              onClick={onNewClick}
              className="flex items-center gap-2 rounded-full bg-[#b48a70] text-[#420c1a] font-medium text-sm px-4 py-2 shadow-md hover:bg-[#a37b64] focus:outline-none focus:ring-2 focus:ring-[#f7f3e8]/70 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 h-[1px] bg-[#b48a70]/40" />
    </div>
  );
}
