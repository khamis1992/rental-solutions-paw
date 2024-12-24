import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { File, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import { CreateLegalCaseDialog } from "./CreateLegalCaseDialog";
import { ViewLegalCaseDialog } from "./ViewLegalCaseDialog";
import { LegalCase, LegalCaseStatus } from "@/types/legal";

export function LegalCasesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LegalCaseStatus>("all");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: legalCases, isLoading } = useQuery({
    queryKey: ["legal-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_cases")
        .select(`
          *,
          customer:profiles!legal_cases_customer_id_fkey(full_name),
          assigned_to_user:profiles!legal_cases_assigned_to_fkey(full_name)
        `);

      if (error) throw error;
      return data as LegalCase[];
    },
  });

  const filteredCases = legalCases?.filter(legalCase => {
    const matchesSearch = legalCase.customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.case_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || legalCase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
            <Select 
              value={statusFilter} 
              onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_reminder">Pending Reminder</SelectItem>
                <SelectItem value="in_legal_process">In Legal Process</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Case
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount Owed</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases?.map((legalCase) => (
                <TableRow key={legalCase.id}>
                  <TableCell>{legalCase.customer.full_name}</TableCell>
                  <TableCell>{legalCase.case_type}</TableCell>
                  <TableCell>
                    <Badge variant={
                      legalCase.status === 'resolved' ? 'default' :
                      legalCase.status === 'escalated' ? 'destructive' :
                      'secondary'
                    }>
                      {legalCase.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>${legalCase.amount_owed.toFixed(2)}</TableCell>
                  <TableCell>{legalCase.assigned_to_user?.full_name || 'Unassigned'}</TableCell>
                  <TableCell>{format(new Date(legalCase.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCase(legalCase.id)}
                    >
                      <File className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!filteredCases || filteredCases.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No legal cases found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateLegalCaseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <ViewLegalCaseDialog
        caseId={selectedCase}
        open={!!selectedCase}
        onOpenChange={(open) => !open && setSelectedCase(null)}
      />
    </div>
  );
}