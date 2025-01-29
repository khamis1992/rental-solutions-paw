import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Eye, Printer, FileText, Trash2 } from "lucide-react";
import type { Agreement } from "../hooks/useAgreements";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

      const { data: { publicUrl } } = supabase.storage
        .from('agreement_documents')
        .getPublicUrl(documents[0].document_url);

      window.open(publicUrl, '_blank');
    } catch (error) {
      console.error('Error viewing contract:', error);
      toast.error('Failed to view contract');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Calculate payment status based on remaining amount
  const paymentStatus = agreement.remainingAmount > 0 ? 'pending' : 'completed';

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-primary hover:underline font-medium"
        >
          {agreement.agreement_number}
        </button>
      </TableCell>
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-primary hover:underline"
        >
          {agreement.vehicle?.license_plate}
        </button>
      </TableCell>
      <TableCell>{`${agreement.vehicle?.make} ${agreement.vehicle?.model}`}</TableCell>
      <TableCell>
        <span className="font-medium">{agreement.customer?.full_name}</span>
      </TableCell>
      <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={`${getStatusColor(agreement.status)} capitalize`}
        >
          {agreement.status}
        </Badge>
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={paymentStatus} />
      </TableCell>
      <TableCell className="text-right space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNameClick(agreement.id)}
              >
                <Eye className="h-4 w-4 text-primary hover:text-primary/80" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Agreement</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewContract()}
              >
                <FileText className="h-4 w-4 text-violet-600 hover:text-violet-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Contract</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPrintContract(agreement.id)}
              >
                <Printer className="h-4 w-4 text-blue-600 hover:text-blue-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Print Contract</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteClick}
                className="hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/90" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Agreement</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
};