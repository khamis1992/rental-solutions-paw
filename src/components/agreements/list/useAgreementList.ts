import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LeaseStatus } from "@/types/agreement.types";

export const useAgreementList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: agreements = [], isLoading, error, refetch } = useQuery({
    queryKey: ["agreements", statusFilter, sortOrder, searchQuery],
    queryFn: async () => {
      try {
        console.log('Starting agreement search with query:', searchQuery);
        
        let query = supabase
          .from('leases')
          .select(`
            *,
            customer:customer_id (
              id,
              full_name,
              phone_number,
              email
            ),
            vehicle:vehicle_id (
              id,
              make,
              model,
              year,
              license_plate
            ),
            remaining_amounts!remaining_amounts_lease_id_fkey (
              remaining_amount
            )
          `);

        // Apply status filter if not "all"
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        // Get all agreements first
        const { data: agreements, error } = await query;

        if (error) {
          console.error("Database query error:", error);
          throw new Error(`Failed to fetch agreements: ${error.message}`);
        }

        if (!agreements) {
          console.log("No agreements found in database");
          return [];
        }

        // Filter results based on search query
        const trimmedSearch = searchQuery.trim().toLowerCase();
        const filteredAgreements = agreements.filter(agreement => {
          if (!trimmedSearch) return true;

          const customerName = agreement.customer?.full_name?.toLowerCase() || '';
          const licensePlate = agreement.vehicle?.license_plate?.toLowerCase() || '';
          const agreementNumber = agreement.agreement_number?.toLowerCase() || '';
          
          return customerName.includes(trimmedSearch) ||
                 licensePlate.includes(trimmedSearch) ||
                 agreementNumber.includes(trimmedSearch);
        });

        // Apply sorting
        const sortedAgreements = [...filteredAgreements].sort((a, b) => {
          if (sortOrder === "oldest") {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        console.log(`Found ${sortedAgreements.length} agreements`);
        return sortedAgreements;
      } catch (err) {
        console.error("Error in useAgreementList:", err);
        throw err;
      }
    },
    meta: {
      onError: (error: Error) => {
        toast.error(`Error loading agreements: ${error.message}`);
      }
    }
  });

  const handleViewContract = async (agreementId: string) => {
    try {
      const { data: agreement, error } = await supabase
        .from('leases')
        .select('*')
        .eq('id', agreementId)
        .maybeSingle();

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
        .maybeSingle();

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
                <p>${agreement.vehicles?.year} ${agreement.vehicles?.make} ${agreement.vehicles?.model}</p>
              </div>
              <div class="section">
                <h2>Customer Details</h2>
                <p>${agreement.profiles?.full_name}</p>
                <p>${agreement.profiles?.address}</p>
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

  const totalPages = Math.ceil((agreements?.length || 0) / 10);

  return {
    currentPage,
    setCurrentPage,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    agreements,
    totalPages,
    isLoading,
    error,
    handleViewContract,
    handlePrintContract,
    refetch,
  };
};
