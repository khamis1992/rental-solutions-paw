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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function AuditRecordsList() {
  const { data: auditRecords, isLoading } = useQuery({
    queryKey: ["audit-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_records")
        .select("*")
        .order("submission_deadline", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Auditor</TableHead>
            <TableHead>License #</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditRecords?.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.audit_year}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    record.status === "completed"
                      ? "success"
                      : record.status === "overdue"
                      ? "destructive"
                      : "default"
                  }
                >
                  {record.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(record.submission_deadline), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {record.submitted_date
                  ? format(new Date(record.submitted_date), "MMM d, yyyy")
                  : "-"}
              </TableCell>
              <TableCell>{record.auditor_name || "-"}</TableCell>
              <TableCell>{record.auditor_license_number || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}