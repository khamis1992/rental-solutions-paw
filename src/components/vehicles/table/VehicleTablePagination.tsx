import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface VehicleTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const VehicleTablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: VehicleTablePaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < totalPages - 2;

  const getVisiblePages = () => {
    if (totalPages <= 5) return pages;

    if (currentPage <= 3) {
      return [...pages.slice(0, 4), totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, ...pages.slice(totalPages - 4)];
    }

    return [
      1,
      ...pages.slice(currentPage - 2, currentPage + 1),
      totalPages,
    ];
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {getVisiblePages().map((page, index, array) => (
          <PaginationItem key={page}>
            {showEllipsisStart && index === 1 && page !== 2 && (
              <PaginationEllipsis />
            )}
            <PaginationLink
              onClick={() => onPageChange(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
            {showEllipsisEnd && index === array.length - 2 && page !== totalPages - 1 && (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};