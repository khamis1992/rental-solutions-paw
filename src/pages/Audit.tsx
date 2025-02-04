import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, PlusCircle, Pencil, Trash2, User, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Audit = () => {
  const [entityFilter, setEntityFilter] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit-logs", entityFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs_with_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (entityFilter) {
        query = query.eq("entity_type", entityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = auditLogs?.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.entity_type?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.performed_by_name?.toLowerCase().includes(searchLower)
    );
  });

  const uniqueEntityTypes = Array.from(
    new Set(auditLogs?.map((log) => log.entity_type).filter(Boolean) || [])
  );

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    toast.success("Copied to clipboard");
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'insert':
        return <PlusCircle className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Pencil className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Audit Logs</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="w-full sm:w-[200px]">
                <Select 
                  value={entityFilter} 
                  onValueChange={setEntityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueEntityTypes.map((type) => (
                      <SelectItem key={type} value={type || "unknown"}>
                        {type?.replace(/_/g, " ").toLowerCase() || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead className="w-[300px]">Changes</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.map((log) => (
                    <TableRow 
                      key={log.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {format(new Date(log.created_at), "PPpp")}
                      </TableCell>
                      <TableCell className="capitalize">
                        {log.entity_type?.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="capitalize">
                            {log.action?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{log.performed_by_name || "System"}</TableCell>
                      <TableCell>
                        <div className="relative">
                          <div className={`${expandedRows.has(log.id) ? '' : 'max-h-20 overflow-hidden'}`}>
                            {log.changes ? (
                              <pre className="text-xs whitespace-pre-wrap">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            ) : (
                              "No changes recorded"
                            )}
                          </div>
                          {log.changes && (
                            <div className="absolute bottom-0 right-0 flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRowExpansion(log.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {expandedRows.has(log.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.changes && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(log.changes)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Audit;