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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AuditLogViewer() {
  const [entityFilter, setEntityFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', entityFilter, actionFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (entityFilter) {
        query = query.eq('entity_type', entityFilter);
      }
      if (actionFilter) {
        query = query.eq('action', actionFilter);
      }
      if (searchQuery) {
        query = query.or(`
          entity_id.ilike.%${searchQuery}%,
          action.ilike.%${searchQuery}%,
          entity_type.ilike.%${searchQuery}%
        `);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading audit logs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All entities</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="agreement">Agreement</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="view">View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Entity ID</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {format(new Date(log.created_at), 'PPpp')}
              </TableCell>
              <TableCell>{log.profiles?.full_name || 'System'}</TableCell>
              <TableCell>
                <Badge variant="outline">{log.action}</Badge>
              </TableCell>
              <TableCell>{log.entity_type}</TableCell>
              <TableCell className="font-mono text-sm">
                {log.entity_id?.slice(0, 8)}...
              </TableCell>
              <TableCell>
                {log.changes && (
                  <pre className="text-xs">
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}