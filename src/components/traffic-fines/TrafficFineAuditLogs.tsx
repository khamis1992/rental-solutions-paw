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
import { format } from "date-fns";

export const TrafficFineAuditLogs = () => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["traffic-fine-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(full_name)
        `)
        .eq('entity_type', 'traffic_fine')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Activity Log</h3>
      
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs?.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>{log.user?.full_name || 'System'}</TableCell>
                <TableCell className="capitalize">{log.action}</TableCell>
                <TableCell className="max-w-md truncate">
                  {log.changes ? JSON.stringify(log.changes) : '-'}
                </TableCell>
              </TableRow>
            ))}
            {!auditLogs?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No activity logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};