import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { AssignFineDialog } from "./AssignFineDialog";

export const UnassignedFines = () => {
  const [selectedFine, setSelectedFine] = useState<string | null>(null);

  const { data: unassignedFines, isLoading } = useQuery({
    queryKey: ['unassigned-fines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select(`
          *,
          vehicle:vehicles(license_plate)
        `)
        .eq('assignment_status', 'pending')
        .order('fine_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading unassigned fines...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Unassigned Fines</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Violation No.</TableHead>
            <TableHead>Plate Number</TableHead>
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
                  onClick={() => setSelectedFine(fine.id)}
                >
                  Assign
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!unassignedFines?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No unassigned fines
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AssignFineDialog
        fineId={selectedFine}
        open={!!selectedFine}
        onOpenChange={(open) => !open && setSelectedFine(null)}
      />
    </div>
  );
};