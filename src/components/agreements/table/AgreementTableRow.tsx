import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Eye, Printer, FileText, Trash2 } from "lucide-react";
import type { Agreement } from "../hooks/useAgreements";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgreementTableRowProps {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleted?: () => void;
  onDeleteClick: () => void;
}

export const AgreementTableRow = ({
  agreement,
  onViewContract,
  onPrintContract,
  onAgreementClick,
  onNameClick,
  onDeleteClick,
}: AgreementTableRowProps) => {
  const handleViewContract = async () => {
    try {
      // Get the latest contract document
      const { data: documents, error } = await supabase
        .from('agreement_documents')
        .select('document_url')
        .eq('lease_id', agreement.id)
        .eq('document_type', 'contract')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!documents || documents.length === 0) {
        toast.error('No contract document found');
        return;
      }

      // Get the public URL for the document
      const { data: { publicUrl } } = supabase.storage
        .from('agreement_documents')
        .getPublicUrl(documents[0].document_url);

      // Open the document in a new tab
      window.open(publicUrl, '_blank');
    } catch (error) {
      console.error('Error viewing contract:', error);
      toast.error('Failed to view contract');
    }
  };

  return (
    <TableRow>
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-blue-600 hover:underline"
        >
          {agreement.agreement_number}
        </button>
      </TableCell>
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-blue-600 hover:underline"
        >
          {agreement.vehicle?.license_plate}
        </button>
      </TableCell>
      <TableCell>{`${agreement.vehicle?.make} ${agreement.vehicle?.model}`}</TableCell>
      <TableCell>{agreement.customer?.full_name}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {agreement.status}
        </Badge>
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={agreement.payment_status || 'pending'} />
      </TableCell>
      <TableCell>
        {agreement.next_payment_date ? (
          formatDateToDisplay(agreement.next_payment_date)
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewContract()}
          title="View Contract"
        >
          <Eye className="h-4 w-4 text-primary hover:text-primary/80" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPrintContract(agreement.id)}
          title="Print Contract"
        >
          <Printer className="h-4 w-4 text-blue-600 hover:text-blue-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAgreementClick(agreement.id)}
          title="View Invoice"
        >
          <FileText className="h-4 w-4 text-violet-600 hover:text-violet-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteClick}
          className="hover:bg-destructive/10"
          title="Delete Agreement"
        >
          <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/90" />
        </Button>
      </TableCell>
    </TableRow>
  );
};