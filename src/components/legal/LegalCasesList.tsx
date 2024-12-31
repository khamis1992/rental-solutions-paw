import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewLegalCaseDialog } from "./ViewLegalCaseDialog";
import { LegalCase } from "@/types/legal";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SortAsc, SortDesc, Eye } from "lucide-react";
import { format } from "date-fns";

type LegalCaseWithCustomer = LegalCase & {
  customer: {
    full_name: string;
  };
};

export const LegalCasesList = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: legalCases, isLoading } = useQuery({
    queryKey: ["legal-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_cases")
        .select(`
          *,
          customer:profiles(full_name)
        `);

      if (error) throw error;
      
      // Type assertion after validation
      const validatedData = data?.map(item => {
        if (!item.customer?.full_name) {
          throw new Error(`Missing customer data for case ${item.id}`);
        }
        return item as LegalCaseWithCustomer;
      });

      return validatedData || [];
    },
  });

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending_reminder: "bg-yellow-500",
      in_legal_process: "bg-blue-500",
      escalated: "bg-red-500",
      resolved: "bg-green-500",
    };
    return statusColors[status] || "bg-gray-500";
  };

  const filteredCases = legalCases?.filter(caseItem =>
    caseItem.customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.case_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCases = filteredCases?.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Legal Cases</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Legal Cases</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
              >
                {sortDirection === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Amount Owed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCases?.map((caseItem) => (
                <TableRow key={caseItem.id} className="group hover:bg-muted/50">
                  <TableCell className="font-medium">{caseItem.customer.full_name}</TableCell>
                  <TableCell>{caseItem.case_type}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${getStatusColor(caseItem.status)} text-white`}>
                      {caseItem.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(caseItem.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(caseItem.amount_owed)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCaseId(caseItem.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ViewLegalCaseDialog
        caseId={selectedCaseId}
        open={!!selectedCaseId}
        onOpenChange={(open) => !open && setSelectedCaseId(null)}
      />
    </div>
  );
};