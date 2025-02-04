import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAgreements } from "../hooks/useAgreements";

const ITEMS_PER_PAGE = 10;

export const useAgreementList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const { data: agreements = [], isLoading, error, refetch } = useAgreements();

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

  // Filter and sort agreements
  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch =
      !searchQuery ||
      agreement.agreement_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.vehicle?.license_plate?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || agreement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort agreements
  const sortedAgreements = [...filteredAgreements].sort((a, b) => {
    switch (sortOrder) {
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "amount-high":
        return b.total_amount - a.total_amount;
      case "amount-low":
        return a.total_amount - b.total_amount;
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const totalPages = Math.ceil(sortedAgreements.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAgreements = sortedAgreements.slice(startIndex, endIndex);

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