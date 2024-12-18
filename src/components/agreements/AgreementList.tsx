import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Table, TableBody } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceDialog } from "./InvoiceDialog";
import { PaymentTrackingDialog } from "./PaymentTrackingDialog";
import { PaymentHistoryDialog } from "./PaymentHistoryDialog";
import { AgreementTableHeader } from "./table/AgreementTableHeader";
import { AgreementTableRow } from "./table/AgreementTableRow";
import { formatCurrency } from "@/lib/utils";

interface Agreement {
  id: string;
  customer: {
    id: string;
    full_name: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
}

export const AgreementList = () => {
  const navigate = useNavigate();
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [selectedPaymentTrackingId, setSelectedPaymentTrackingId] = useState<string | null>(null);
  const [selectedPaymentHistoryId, setSelectedPaymentHistoryId] = useState<string | null>(null);

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ['agreements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          start_date,
          end_date,
          status,
          total_amount,
          profiles:customer_id (id, full_name),
          vehicles (id, make, model, year)
        `);

      if (error) {
        toast.error("Failed to fetch agreements");
        throw error;
      }

      return data.map((lease: any) => ({
        id: lease.id,
        customer: {
          id: lease.profiles.id,
          full_name: lease.profiles.full_name,
        },
        vehicle: {
          id: lease.vehicles.id,
          make: lease.vehicles.make,
          model: lease.vehicles.model,
          year: lease.vehicles.year,
        },
        start_date: lease.start_date,
        end_date: lease.end_date,
        status: lease.status,
        total_amount: lease.total_amount,
      }));
    },
  });

  const handleViewContract = async (agreementId: string) => {
    try {
      const { data: agreement, error } = await supabase
        .from('leases')
        .select('*')
        .eq('id', agreementId)
        .single();

      if (error) throw error;

      if (agreement) {
        navigate(`/agreements/${agreementId}/view`);
      } else {
        toast.error("Agreement not found");
      }
    } catch (error) {
      console.error('Error viewing contract:', error);
      toast.error("Failed to view contract");
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

      if (agreement) {
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
                  <p>Total Amount: ${formatCurrency(agreement.total_amount)}</p>
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
      } else {
        toast.error("Agreement not found");
      }
    } catch (error) {
      console.error('Error printing contract:', error);
      toast.error("Failed to print contract");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <AgreementTableHeader />
          <TableBody>
            {agreements.map((agreement: Agreement) => (
              <AgreementTableRow
                key={agreement.id}
                agreement={agreement}
                onViewContract={handleViewContract}
                onPrintContract={handlePrintContract}
                onAgreementClick={setSelectedAgreementId}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      <InvoiceDialog
        agreementId={selectedAgreementId || ""}
        open={!!selectedAgreementId}
        onOpenChange={(open) => !open && setSelectedAgreementId(null)}
      />

      <PaymentTrackingDialog
        agreementId={selectedPaymentTrackingId || ""}
        open={!!selectedPaymentTrackingId}
        onOpenChange={(open) => !open && setSelectedPaymentTrackingId(null)}
      />

      <PaymentHistoryDialog
        agreementId={selectedPaymentHistoryId || ""}
        open={!!selectedPaymentHistoryId}
        onOpenChange={(open) => !open && setSelectedPaymentHistoryId(null)}
      />
    </>
  );
};