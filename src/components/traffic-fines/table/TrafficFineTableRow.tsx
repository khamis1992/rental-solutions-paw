import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Wand2 } from "lucide-react";
import { CustomerSelect } from "../../agreements/form/CustomerSelect";

interface TrafficFineTableRowProps {
  fine: any;
  onAssignCustomer: (fineId: string, customerId: string) => void;
  onAiAssignment: (fineId: string) => void;
  onMarkAsPaid: (fineId: string) => void;
}

export const TrafficFineTableRow = ({
  fine,
  onAssignCustomer,
  onAiAssignment,
  onMarkAsPaid,
}: TrafficFineTableRowProps) => {
  return (
    <TableRow key={fine.id}>
      <TableCell>{fine.serial_number}</TableCell>
      <TableCell>{fine.violation_number}</TableCell>
      <TableCell>
        {new Date(fine.violation_date).toLocaleDateString()}
      </TableCell>
      <TableCell>
        {fine.vehicle?.license_plate || 'N/A'}
      </TableCell>
      <TableCell>{fine.fine_location}</TableCell>
      <TableCell>{fine.violation_charge}</TableCell>
      <TableCell>{formatCurrency(fine.fine_amount)}</TableCell>
      <TableCell>{fine.violation_points}</TableCell>
      <TableCell>
        <Badge
          variant={fine.payment_status === 'completed' ? 'success' : 'secondary'}
        >
          {fine.payment_status === 'completed' ? 'Paid' : 'Pending'}
        </Badge>
      </TableCell>
      <TableCell>
        {fine.lease?.customer ? (
          fine.lease.customer.full_name
        ) : (
          <div className="flex items-center gap-2">
            <CustomerSelect
              register={() => {}}
              onCustomerSelect={(customerId) => onAssignCustomer(fine.id, customerId)}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onAiAssignment(fine.id)}
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell>
        {fine.payment_status !== 'completed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkAsPaid(fine.id)}
          >
            Mark as Paid
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};