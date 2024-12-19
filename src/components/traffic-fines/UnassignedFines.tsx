import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AssignFineDialog } from "./AssignFineDialog";
import { formatCurrency } from "@/lib/utils";

interface TrafficFine {
  id: string;
  fine_date: string;
  violation_number: string;
  fine_location: string;
  fine_amount: number;
  fine_type: string;
  assignment_status: string;
  assignment_notes: string;
  vehicle: {
    license_plate: string;
  } | null;
}

export const UnassignedFines = () => {
  const [selectedFineId, setSelectedFineId] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const { data: unassignedFines, isLoading } = useQuery<TrafficFine[]>({
    queryKey: ["unassigned-fines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select(`
          *,
          vehicle:vehicles(license_plate)
        `)
        .eq('assignment_status', 'pending')
        .order('fine_date', { ascending: false });

      if (error) {
        console.error("Error fetching unassigned fines:", error);
        throw error;
      }

      return data;
    },
  });

  const handleAssignClick = (fineId: string) => {
    setSelectedFineId(fineId);
    setShowAssignDialog(true);
  };

  if (isLoading) {
    return <div>Loading unassigned fines...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Violation #</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unassignedFines?.map((fine) => (
            <TableRow key={fine.id}>
              <TableCell>
                {new Date(fine.fine_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{fine.violation_number}</TableCell>
              <TableCell>{fine.vehicle?.license_plate}</TableCell>
              <TableCell>{fine.fine_location}</TableCell>
              <TableCell>{formatCurrency(fine.fine_amount)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssignClick(fine.id)}
                >
                  Assign
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedFineId && (
        <AssignFineDialog
          fineId={selectedFineId}
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
        />
      )}
    </div>
  );
};