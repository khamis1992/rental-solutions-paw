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
import { Eye, FileText, Receipt, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useState } from "react";
import { InvoiceDialog } from "./InvoiceDialog";
import { PaymentTrackingDialog } from "./PaymentTrackingDialog";

const agreements = [
  {
    id: "AGR-001",
    customer: "John Doe",
    customerId: "1", // Added customerId for linking
    vehicle: "2024 Toyota Camry",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    status: "active",
    amount: 450.00,
  },
  {
    id: "AGR-002",
    customer: "Jane Smith",
    customerId: "2",
    vehicle: "2023 Honda CR-V",
    startDate: "2024-03-18",
    endDate: "2024-03-25",
    status: "pending",
    amount: 680.00,
  },
  {
    id: "AGR-003",
    customer: "Mike Johnson",
    customerId: "3",
    vehicle: "2024 BMW X5",
    startDate: "2024-03-10",
    endDate: "2024-03-17",
    status: "expired",
    amount: 890.00,
  },
];

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

export const AgreementList = () => {
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [selectedPaymentTrackingId, setSelectedPaymentTrackingId] = useState<string | null>(null);

  const handleViewContract = (agreementId: string) => {
    window.open(`/agreements/${agreementId}/view`, '_blank');
  };

  const handlePrintContract = (agreementId: string) => {
    window.open(`/agreements/${agreementId}/print`, '_blank', 'width=800,height=600');
  };

  const handleViewInvoice = (agreementId: string) => {
    setSelectedAgreementId(agreementId);
  };

  const handleViewPayments = (agreementId: string) => {
    setSelectedPaymentTrackingId(agreementId);
  };

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
            {agreements.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell className="font-medium">{agreement.id}</TableCell>
                <TableCell>
                  <Link 
                    to={`/customers/${agreement.customerId}`}
                    className="text-primary hover:underline"
                  >
                    {agreement.customer}
                  </Link>
                </TableCell>
                <TableCell>{agreement.vehicle}</TableCell>
                <TableCell>{agreement.startDate}</TableCell>
                <TableCell>{agreement.endDate}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(agreement.status)}
                  >
                    {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(agreement.amount)}</TableCell>
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
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewInvoice(agreement.id)}
                      title="View Invoice"
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewPayments(agreement.id)}
                      title="View Payments"
                    >
                      <CreditCard className="h-4 w-4" />
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
    </>
  );
};
