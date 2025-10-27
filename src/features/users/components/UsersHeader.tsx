import SearchBar from "../../../components/ui/common/SearchBar"; 

type Props = {
  title: string;
  showSearch?: boolean;
  query?: string;
  onQueryChange?: (v: string) => void;
  showNewButton?: boolean;
  onNewClick?: () => void;
};

export default function UsersHeader({
  title,
  showSearch = false,
  query = "",
  onQueryChange,
  showNewButton = false,
  onNewClick,
}: Props) {
  return (
    <div className="rounded-t-xl bg-[#5b1d27] px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 🔹 Título */}
        <h2 className="text-white font-semibold text-lg tracking-wide">
          {title}
        </h2>

        {/* 🔹 Buscador y botón */}
        <div className="flex items-center gap-3">
          {showSearch && (
            <SearchBar
              value={query}
              onChange={(v) => onQueryChange?.(v)}
              placeholder="Buscar..."
            />
          )}

          {showNewButton && (
            <button
              onClick={onNewClick}
              className="
                flex items-center gap-2
                rounded-full
                bg-[#b48a70]
                text-[#420c1a]
                font-medium text-sm
                px-4 py-2
                shadow-md
                hover:bg-[#a37b64] hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-[#f7f3e8]/70
                transition-all
              "
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                className='w-4 h-4'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 4v16m8-8H4'
                />
              </svg>
              Nuevo
            </button>
          )}
        </div>
      </div>

      {/* 🔸 Separador inferior dorado */}
      <div className="mt-3 h-[1px] bg-[#b48a70]/40" />
    </div>
  );
}
