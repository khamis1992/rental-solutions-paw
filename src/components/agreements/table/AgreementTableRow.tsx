import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Eye, Printer, FileText, Trash2 } from "lucide-react";
import type { Agreement } from "../hooks/useAgreements";

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
      <TableCell>{agreement.vehicle?.license_plate}</TableCell>
      <TableCell>{`${agreement.vehicle?.make} ${agreement.vehicle?.model}`}</TableCell>
      <TableCell>{agreement.customer?.full_name}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {agreement.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewContract(agreement.id)}
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