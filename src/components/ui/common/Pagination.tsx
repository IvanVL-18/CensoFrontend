type Props = {
  page: number;
  perPage: number;
  total: number;
  onChangePage: (p: number) => void;
  onChangePerPage: (pp: number) => void;
  perPageOptions?: number[];
};

export default function Pagination({
  page,
  perPage,
  total,
  onChangePage,
  onChangePerPage,
  perPageOptions = [5, 10, 20],
}: Props) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const canPrev = page > 1;
  const canNext = page < pages;
  const go = (p: number) => onChangePage(Math.min(Math.max(1, p), pages));

  const around = [page - 1, page, page + 1].filter(
    (n) => n >= 1 && n <= pages
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <div className="join">
        <button className="join-item btn btn-xs rounded-full px-3 disabled:opacity-50"
                onClick={() => go(1)} disabled={!canPrev}>«</button>
        <button className="join-item btn btn-xs rounded-full px-3 disabled:opacity-50"
                onClick={() => go(page - 1)} disabled={!canPrev}>‹</button>
        {around.map((n) => (
          <button key={n}
            className={`join-item btn btn-xs rounded-full px-3 ${n === page ? "bg-neutral-800 text-white" : "bg-neutral-100"}`}
            onClick={() => go(n)}
          >
            {n}
          </button>
        ))}
        <button className="join-item btn btn-xs rounded-full px-3 disabled:opacity-50"
                onClick={() => go(page + 1)} disabled={!canNext}>›</button>
        <button className="join-item btn btn-xs rounded-full px-3 disabled:opacity-50"
                onClick={() => go(pages)} disabled={!canNext}>»</button>
      </div>

      <div className="ml-2 flex items-center gap-2">
        <span className="text-sm text-neutral-600">N</span>
        <select
          value={perPage}
          onChange={(e) => onChangePerPage(parseInt(e.target.value))}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm"
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
