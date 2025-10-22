type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
}: Props) {
  return (
    <div className="relative w-full max-w-xs">
      {/* Input */}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-full
          border border-[#b48a70]/70
          bg-[#fdfbf8]
          pl-4 pr-10 py-2
          text-sm text-[#420c1a]
          placeholder:text-neutral-400
          shadow-inner
          focus:outline-none
          focus:border-[#b48a70]
          focus:ring-2 focus:ring-[#b48a70]/40
          transition-all
        "
      />

      {/* Ícono de búsqueda */}
      <span
        className="
          absolute right-3 top-1/2 -translate-y-1/2
          text-[#5b1d27]
          opacity-80
          hover:opacity-100
          transition
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
          />
        </svg>
      </span>
    </div>
  );
}
