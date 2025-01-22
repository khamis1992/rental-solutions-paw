import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
  return (
    <div className="flex justify-center mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Previous</span>
            </button>
          </PaginationItem>

          <PaginationItem>
            <PaginationLink 
              isActive={true}
              className="px-4 py-2 text-sm font-medium bg-white border rounded-lg"
            >
              {currentPage}
            </PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};