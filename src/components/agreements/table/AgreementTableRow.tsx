import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Receipt } from "lucide-react";
import { formatDateToDisplay } from "../utils/dateUtils";
import type { Agreement } from "../hooks/useAgreements";

interface AgreementTableRowProps {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
}

export const AgreementTableRow = ({
  agreement,
  onViewContract,
  onPrintContract,
  onAgreementClick,
}: AgreementTableRowProps) => {
  return (
    <TableRow>
      <TableCell>{agreement.agreement_number}</TableCell>
      <TableCell>{agreement.vehicle?.license_plate || 'N/A'}</TableCell>
      <TableCell>{agreement.customer.full_name}</TableCell>
      <TableCell>
        {formatDateToDisplay(agreement.start_date)}
      </TableCell>
      <TableCell>
        {formatDateToDisplay(agreement.end_date)}
      </TableCell>
      <TableCell>
        <Badge
          variant={agreement.status === "active" ? "default" : "secondary"}
          className="capitalize"
        >
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
          <span className="sr-only">View Contract</span>
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPrintContract(agreement.id)}
          title="Print Contract"
        >
          <span className="sr-only">Print Contract</span>
          <Printer className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAgreementClick(agreement.id)}
          title="View Invoice"
        >
          <span className="sr-only">View Invoice</span>
          <Receipt className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};