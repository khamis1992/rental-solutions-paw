import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Agreement, LeaseStatus } from "@/types/agreement.types";

export const useAgreementList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | "all">("all");
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
          remaining_amounts (
            remaining_amount
          )
        `);

      // Apply search filter if query exists
      if (searchQuery) {
        query = query.or(
          `agreement_number.ilike.%${searchQuery}%`,
          `customer_id.eq.(select id from profiles where full_name ilike '%${searchQuery}%')`,
          `vehicle_id.eq.(select id from vehicles where license_plate ilike '%${searchQuery}%')`
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

      // Transform the data to match the Agreement type
      const transformedData = data?.map(agreement => ({
        ...agreement,
        customer: agreement.customer || null,
        vehicle: agreement.vehicle || null,
        remaining_amount: agreement.remaining_amounts?.[0]?.remaining_amount || 0,
        rent_amount: agreement.rent_amount || 0,
        daily_late_fee: agreement.daily_late_fee || 0
      })) as Agreement[];

      return transformedData;
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

  const filteredAgreements = agreements || [];
  const totalPages = Math.ceil(filteredAgreements.length / 10);
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
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