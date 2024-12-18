import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { InvoiceDialog } from "./InvoiceDialog";
import { PaymentTrackingDialog } from "./PaymentTrackingDialog";
import { PaymentHistoryDialog } from "./PaymentHistoryDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case "expired":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
  }
};

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

  const { data: agreements = [], isLoading, refetch } = useQuery({
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
        // Open in new window for printing
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
          <TableHeader>
            <TableRow>
              <TableHead>Agreement ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agreements.map((agreement: Agreement) => (
              <TableRow key={agreement.id}>
                <TableCell>
                  <button
                    onClick={() => setSelectedAgreementId(agreement.id)}
                    className="font-medium text-primary hover:underline"
                  >
                    {agreement.id}
                  </button>
                </TableCell>
                <TableCell>
                  <Link 
                    to={`/customers/${agreement.customer.id}`}
                    className="text-primary hover:underline"
                  >
                    {agreement.customer.full_name}
                  </Link>
                </TableCell>
                <TableCell>{`${agreement.vehicle.year} ${agreement.vehicle.make} ${agreement.vehicle.model}`}</TableCell>
                <TableCell>{new Date(agreement.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(agreement.end_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(agreement.status)}
                  >
                    {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(agreement.total_amount)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewContract(agreement.id)}
                      title="View Contract"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handlePrintContract(agreement.id)}
                      title="Print Contract"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
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