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
import { Loader2 } from "lucide-react";

export const RawTrafficFinesList = () => {
  const { data: fines, isLoading } = useQuery({
    queryKey: ["raw-traffic-fines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fines?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No traffic fines found
      </div>
    );
  }

  // Get all unique keys from all records to handle inconsistent columns
  const allColumns = Array.from(
    new Set(fines.flatMap(fine => Object.keys(fine)))
  ).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {allColumns.map((column) => (
              <TableHead key={column} className="whitespace-nowrap">
                {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fines.map((fine) => (
            <TableRow key={fine.id}>
              {allColumns.map((column) => (
                <TableCell key={column}>
                  {fine[column] !== null ? String(fine[column]) : '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};