import { useState } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MaintenanceFilters } from "./MaintenanceFilters";
import { VehicleTablePagination } from "../vehicles/table/VehicleTablePagination";
import { MaintenanceDetailsDialog } from "./MaintenanceDetailsDialog";
import { MaintenanceTableHeader } from "./table/MaintenanceTableHeader";
import { MaintenanceTableRow } from "./table/MaintenanceTableRow";
import { useMaintenanceRecords } from "./hooks/useMaintenanceRecords";
import type { MaintenanceRecord } from "./types/maintenance";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

export const MaintenanceList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "all",
    dateRange: "all",
    categoryId: undefined,
  });

  const navigate = useNavigate();

  const { data, isLoading, error } = useMaintenanceRecords({
    searchQuery,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const records = data?.records || [];
  const totalCount = data?.totalCount || 0;

  const filteredRecords = records.filter(record => {
    if (filters.status !== "all" && record.status !== filters.status) return false;
    if (filters.categoryId && record.category_id !== filters.categoryId) return false;
    return true;
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleMaintenanceEdit = (maintenanceId: string) => {
    setSelectedMaintenanceId(maintenanceId);
    setShowDetailsDialog(true);
  };

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <MaintenanceFilters 
          filters={filters}
          setFilters={setFilters}
        />
        <div className="text-center py-8 text-red-500">
          Error loading maintenance records. Please try again.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <MaintenanceFilters 
          filters={filters}
          setFilters={setFilters}
        />
        <div className="rounded-md border bg-card">
          <Table>
            <MaintenanceTableHeader />
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><Skeleton className="h-4 w-[200px]" /></td>
                  <td><Skeleton className="h-4 w-[120px]" /></td>
                  <td><Skeleton className="h-4 w-[250px]" /></td>
                  <td><Skeleton className="h-4 w-[100px]" /></td>
                  <td><Skeleton className="h-4 w-[100px]" /></td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!filteredRecords?.length) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <MaintenanceFilters 
          filters={filters}
          setFilters={setFilters}
        />
        <div className="text-center py-8 text-muted-foreground">
          No maintenance records found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <MaintenanceFilters 
        filters={filters}
        setFilters={setFilters}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <MaintenanceTableHeader />
          <TableBody>
            {filteredRecords.map((record) => (
              <MaintenanceTableRow 
                key={record.id}
                record={record}
                onEdit={handleMaintenanceEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-4">
        <VehicleTablePagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page - 1)}
        />
      </div>

      {selectedMaintenanceId && (
        <MaintenanceDetailsDialog
          maintenanceId={selectedMaintenanceId}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </div>
  );
};