import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { formatDateToDisplay } from "../utils/dateUtils";
import type { Agreement } from "../hooks/useAgreements";

interface AgreementTableRowProps {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
}

export const AgreementTableRow = ({
  agreement,
  onViewContract,
  onPrintContract,
  onAgreementClick,
  onNameClick,
}: AgreementTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <button
          onClick={() => onAgreementClick(agreement.id)}
          className="text-blue-600 hover:underline"
        >
          {agreement.agreement_number}
        </button>
      </TableCell>
      <TableCell>{agreement.vehicle.license_plate}</TableCell>
      <TableCell>{`${agreement.vehicle.make} ${agreement.vehicle.model}`}</TableCell>
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-blue-600 hover:underline"
        >
          {agreement.customer.full_name}
        </button>
      </TableCell>
      <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
      <TableCell>
        <span className="capitalize">{agreement.status}</span>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewContract(agreement.id)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};