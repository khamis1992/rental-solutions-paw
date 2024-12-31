import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, AlertTriangle } from "lucide-react";

interface LegalCase {
  id: string;
  case_type: string;
  status: string;
  amount_owed: number;
  priority: "low" | "medium" | "high";
  customer?: {
    id: string;
    full_name: string;
  };
  traffic_fines?: Array<{
    id: string;
    traffic_fines?: Array<{
      fine_amount: number;
    }>;
  }>;
}

export const LegalCasesList = () => {
  const { data: cases, isLoading } = useQuery({
    queryKey: ["legal-cases"],
    queryFn: async () => {
      const { data: legalCases, error } = await supabase
        .from("legal_cases")
        .select(`
          *,
          customer:customer_id (
            id,
            full_name
          ),
          traffic_fines:leases (
            id,
            traffic_fines (
              fine_amount
            )
          )
        `);

      if (error) {
        console.error("Error fetching legal cases:", error);
        throw error;
      }

      // Calculate total fines for each case
      return (legalCases || []).map(legalCase => ({
        ...legalCase,
        total_fines: (legalCase.traffic_fines || []).reduce((total, lease) => {
          const leaseFines = (lease.traffic_fines || []).reduce((sum, fine) => sum + (fine.fine_amount || 0), 0) || 0;
          return total + leaseFines;
        }, 0)
      }));
    },
  });

  if (isLoading) {
    return <div>Loading cases...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Case Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount Owed</TableHead>
            <TableHead>Total Fines</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases?.map((case_) => (
            <TableRow key={case_.id}>
              <TableCell>{case_.customer?.full_name}</TableCell>
              <TableCell>{case_.case_type}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {case_.status}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(case_.amount_owed || 0)}</TableCell>
              <TableCell>{formatCurrency(case_.total_fines || 0)}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    case_.priority === "high" 
                      ? "destructive" 
                      : case_.priority === "medium" 
                      ? "warning" 
                      : "default"
                  }
                >
                  {case_.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = `/legal/cases/${case_.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/legal/cases/${case_.id}/documents`, '_blank')}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                {case_.priority === "high" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};