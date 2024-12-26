import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateToDisplay } from "@/lib/dateUtils";
import type { Agreement } from "../hooks/useAgreements";
import { useState } from "react";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
import { CustomerDetailsDialog } from "@/components/customers/CustomerDetailsDialog";
import { DeleteAgreementDialog } from "../DeleteAgreementDialog";
import { Trash2 } from "lucide-react";

interface AgreementTableRowProps {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleted?: () => void;
}

export const AgreementTableRow = ({
  agreement,
  onViewContract,
  onPrintContract,
  onAgreementClick,
  onNameClick,
  onDeleted,
}: AgreementTableRowProps) => {
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const badgeVariant = agreement.status as "active" | "pending_payment" | "pending_deposit" | "closed";

  return (
    <>
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
            onClick={() => setShowVehicleDetails(true)}
            className="text-blue-600 hover:underline"
          >
            {agreement.vehicle.license_plate}
          </button>
        </TableCell>
        <TableCell>{`${agreement.vehicle.make} ${agreement.vehicle.model}`}</TableCell>
        <TableCell>
          <button
            onClick={() => setShowCustomerDetails(true)}
            className="text-blue-600 hover:underline"
          >
            {agreement.customer.full_name}
          </button>
        </TableCell>
        <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
        <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
        <TableCell>
          <Badge variant={badgeVariant} className="capitalize">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      <VehicleDetailsDialog
        vehicleId={agreement.vehicle.id}
        open={showVehicleDetails}
        onOpenChange={setShowVehicleDetails}
      />
      <CustomerDetailsDialog
        customerId={agreement.customer.id}
        open={showCustomerDetails}
        onOpenChange={setShowCustomerDetails}
      />
      <DeleteAgreementDialog
        agreementId={agreement.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDeleted={onDeleted}
      />
    </>
  );
};