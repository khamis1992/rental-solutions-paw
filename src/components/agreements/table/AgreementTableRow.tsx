import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <TableCell>{agreement.license_no}</TableCell>
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
        >
          View Contract
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPrintContract(agreement.id)}
        >
          Print
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAgreementClick(agreement.id)}
        >
          View Invoice
        </Button>
      </TableCell>
    </TableRow>
  );
};