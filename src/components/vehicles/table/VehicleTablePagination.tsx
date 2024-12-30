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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              size="default"
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink 
              isActive={true}
              size="default"
              className="text-sm font-medium"
            >
              {currentPage}
            </PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              size="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}