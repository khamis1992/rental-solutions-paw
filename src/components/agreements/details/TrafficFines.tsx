import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { TrafficFine } from "@/types/traffic-fines";
import { format, isValid, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchTrafficFines, deleteAllTrafficFines } from "./utils/trafficFineUtils";
import { TrafficFineStatusBadge } from "./components/TrafficFineStatusBadge";

interface TrafficFinesProps {
  agreementId: string;
}

export const TrafficFines = ({ agreementId }: TrafficFinesProps) => {
  const { toast } = useToast();
  const { data: fines, isLoading, refetch } = useQuery<TrafficFine[]>({
    queryKey: ["traffic-fines", agreementId],
    queryFn: () => fetchTrafficFines(agreementId),
  });

  const handleDeleteAll = async () => {
    try {
      await deleteAllTrafficFines();
      
      toast({
        title: "Success",
        description: "All traffic fines have been deleted",
      });
      
      refetch();
    } catch (error: any) {
      console.error('Delete operation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete traffic fines",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        console.warn(`Invalid date value: ${dateString}`);
        return 'Invalid Date';
      }
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary">Traffic Fines</h3>
        {fines && fines.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all traffic fines
                  associated with this agreement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines?.map((fine) => (
              <TableRow key={fine.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>{formatDate(fine.violation_date)}</TableCell>
                <TableCell>{fine.fine_type}</TableCell>
                <TableCell>{fine.fine_location}</TableCell>
                <TableCell className="font-medium">{formatCurrency(fine.fine_amount)}</TableCell>
                <TableCell>
                  <TrafficFineStatusBadge status={fine.payment_status} />
                </TableCell>
              </TableRow>
            ))}
            {!fines?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No traffic fines recorded
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};