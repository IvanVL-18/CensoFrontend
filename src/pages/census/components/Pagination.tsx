import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {/* Botón de página anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-full bg-[#5F0F1B] text-white disabled:bg-[#ddd]"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Texto de la página actual */}
      <span className="text-sm text-[#5F0F1B]">
        Página {currentPage} de {totalPages}
      </span>

      {/* Botón de página siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-full bg-[#5F0F1B] text-white disabled:bg-[#ddd]"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
