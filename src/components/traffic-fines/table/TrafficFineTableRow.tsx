import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useTrafficFineAssignment } from "../hooks/useTrafficFineAssignment";

interface TrafficFineTableRowProps {
  fine: any;
  onMarkAsPaid: (fineId: string) => void;
}

export const TrafficFineTableRow = ({
  fine,
  onMarkAsPaid,
}: TrafficFineTableRowProps) => {
  const { assignFine } = useTrafficFineAssignment();
  
  const getStatusColor = (status: string): string => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  return (
    <TableRow key={fine.id} className="hover:bg-muted/50">
      <TableCell>{fine.serial_number || 'N/A'}</TableCell>
      <TableCell>{fine.violation_number || 'N/A'}</TableCell>
      <TableCell>
        {new Date(fine.violation_date).toLocaleDateString()}
      </TableCell>
      <TableCell>{fine.license_plate || 'N/A'}</TableCell>
      <TableCell>{fine.fine_location || 'N/A'}</TableCell>
      <TableCell>{fine.violation_charge || 'N/A'}</TableCell>
      <TableCell>{formatCurrency(fine.fine_amount)}</TableCell>
      <TableCell>{fine.violation_points || '0'}</TableCell>
      <TableCell>
        <Badge className={getStatusColor(fine.payment_status)}>
          {fine.payment_status}
        </Badge>
      </TableCell>
      <TableCell>
        {fine.lease?.customer ? (
          <span className="font-medium">{fine.lease.customer.full_name}</span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => assignFine(fine.id)}
          >
            Auto Assign
          </Button>
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