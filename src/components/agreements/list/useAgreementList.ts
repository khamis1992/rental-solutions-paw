import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Agreement } from "@/types/agreement.types";

const ITEMS_PER_PAGE = 10;

export const useAgreementList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const { data: agreements = [], isLoading, error, refetch } = useQuery({
    queryKey: ["agreements", searchQuery, statusFilter, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('leases')
        .select(`
          *,
          customer:customer_id (
            id,
            full_name
          ),
          vehicle:vehicle_id (
            id,
            make,
            model,
            year,
            license_plate
          )
        `);

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `agreement_number.ilike.%${searchQuery}%,` +
          `customer.full_name.ilike.%${searchQuery}%,` +
          `vehicle.license_plate.ilike.%${searchQuery}%`
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply sorting
      switch (sortOrder) {
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "amount-high":
          query = query.order("total_amount", { ascending: false });
          break;
        case "amount-low":
          query = query.order("total_amount", { ascending: true });
          break;
        default: // newest
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching agreements:", error);
        throw error;
      }

      return data as Agreement[];
    },
    refetchOnWindowFocus: true,
    staleTime: 1000, // Consider data stale after 1 second
  });

  const handleViewContract = async (agreementId: string) => {
    try {
      const { data: agreement, error } = await supabase
        .from('leases')
        .select('*')
        .eq('id', agreementId)
        .single();

      if (error) throw error;

      if (!agreement) {
        toast.error("Agreement not found");
        return null;
      }

      return agreement;
    } catch (error) {
      console.error('Error viewing contract:', error);
      toast.error("Failed to view contract");
      return null;
    }
  };

  const handlePrintContract = async (agreementId: string) => {
    try {
      const { data: agreement, error } = await supabase
        .from('leases')
        .select(`
          *,
          vehicles (make, model, year),
          profiles (full_name, address)
        `)
        .eq('id', agreementId)
        .single();

      if (error) throw error;

      if (!agreement) {
        toast.error("Agreement not found");
        return;
      }

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Rental Agreement - ${agreement.id}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .footer { margin-top: 50px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Rental Agreement</h1>
                <p>Agreement ID: ${agreement.id}</p>
              </div>
              <div class="section">
                <h2>Vehicle Details</h2>
                <p>${agreement.vehicles.year} ${agreement.vehicles.make} ${agreement.vehicles.model}</p>
              </div>
              <div class="section">
                <h2>Customer Details</h2>
                <p>${agreement.profiles.full_name}</p>
                <p>${agreement.profiles.address}</p>
              </div>
              <div class="section">
                <h2>Agreement Terms</h2>
                <p>Start Date: ${new Date(agreement.start_date).toLocaleDateString()}</p>
                <p>End Date: ${new Date(agreement.end_date).toLocaleDateString()}</p>
                <p>Total Amount: ${agreement.total_amount}</p>
              </div>
              <div class="footer">
                <p>Signatures:</p>
                <div style="margin-top: 30px;">
                  <div style="float: left; width: 45%;">
                    ____________________<br>
                    Customer Signature
                  </div>
                  <div style="float: right; width: 45%;">
                    ____________________<br>
                    Company Representative
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else {
        toast.error("Unable to open print window");
      }
    } catch (error) {
      console.error('Error printing contract:', error);
      toast.error("Failed to print contract");
    }
  };

  const filteredAgreements = agreements || [];
  const totalPages = Math.ceil(filteredAgreements.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAgreements = filteredAgreements.slice(startIndex, endIndex);

  return {
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    agreements: currentAgreements,
    totalPages,
    isLoading,
    error,
    handleViewContract,
    handlePrintContract,
    refetch,
  };
};
