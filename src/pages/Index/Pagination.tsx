import type { Meta, PaginationProps } from "./indexs.interfaces"; 

export function Pagination({
  meta,
  links,
  loading,
  error,
  onPageClick,
}: PaginationProps) {
  
  if (loading || error || !meta || !links) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-4">
      <div className="text-sm text-gray-700 mb-2 md:mb-0">
        Mostrando <span className="font-medium">{meta.from}</span> a{" "}
        <span className="font-medium">{meta.to}</span> de{" "}
        <span className="font-medium">{meta.total}</span> resultados
      </div>

      <nav
        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
        aria-label="Pagination"
      >
        {meta.links.map((link: Meta["links"][number], index: number) => (
          <button
            key={index}
            onClick={() => onPageClick(link.url)} 
            disabled={!link.url || link.active}
            dangerouslySetInnerHTML={{ __html: link.label }}
            className={`
                relative inline-flex items-center px-4 py-2 border text-sm font-medium
                ${
                  link.active
                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }
                ${
                  !link.url
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : ""
                }
                ${index === 0 ? "rounded-l-md" : ""}
                ${index === meta.links.length - 1 ? "rounded-r-md" : ""}
              `}
          />
        ))}
      </nav>
    </div>
  );
}