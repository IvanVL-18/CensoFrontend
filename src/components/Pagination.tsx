import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
};

const DOTS = "...";

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

function usePagination(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | typeof DOTS)[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = range(1, leftItemCount);

    return [...leftRange, DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = range(totalPages - rightItemCount + 1, totalPages);

    return [firstPageIndex, DOTS, ...rightRange];
  }

  if (showLeftDots && showRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }

  return range(1, totalPages);
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  if (totalPages <= 1) return null;

  const paginationRange = usePagination(currentPage, totalPages, siblingCount);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handleChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <nav
      className={clsx(
        "flex items-center justify-center gap-2 text-sm",
        className
      )}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => handleChange(currentPage - 1)}
        disabled={isFirstPage}
        className={clsx(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
          "bg-white/80 backdrop-blur shadow-sm",
          "hover:shadow-md hover:-translate-y-[1px]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "border-slate-200 hover:border-slate-300",
          "dark:bg-slate-900/80 dark:border-slate-700 dark:hover:border-slate-600"
        )}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <ul className="flex items-center gap-1">
        {paginationRange.map((item, index) => {
          if (item === DOTS) {
            return (
              <li key={`dots-${index}`}>
                <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-slate-400 dark:text-slate-500">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              </li>
            );
          }

          const pageNumber = item as number;
          const isActive = pageNumber === currentPage;

          return (
            <li key={pageNumber}>
              <button
                type="button"
                onClick={() => handleChange(pageNumber)}
                className={clsx(
                  "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border text-sm font-medium transition-all",
                  "bg-white/80 backdrop-blur shadow-sm",
                  "hover:shadow-md hover:-translate-y-[1px]",
                  "border-slate-200 hover:border-slate-300",
                  "dark:bg-slate-900/80 dark:border-slate-700 dark:hover:border-slate-600",
                  isActive &&
                    "border-sky-500 text-sky-600 bg-sky-50/80 dark:border-sky-400 dark:text-sky-300 dark:bg-sky-950/40"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => handleChange(currentPage + 1)}
        disabled={isLastPage}
        className={clsx(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
          "bg-white/80 backdrop-blur shadow-sm",
          "hover:shadow-md hover:-translate-y-[1px]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "border-slate-200 hover:border-slate-300",
          "dark:bg-slate-900/80 dark:border-slate-700 dark:hover:border-slate-600"
        )}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};
