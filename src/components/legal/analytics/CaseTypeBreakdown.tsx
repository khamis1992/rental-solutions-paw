import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export const CaseTypeBreakdown = () => {
  const { data: caseTypes, isLoading } = useQuery({
    queryKey: ['legal-case-types-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_cases')
        .select('case_type');

      if (error) throw error;

      const breakdown = data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.case_type] = (acc[curr.case_type] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(breakdown).map(([type, count]) => ({
        type: type.replace('_', ' ').toUpperCase(),
        count
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Case Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Type Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={caseTypes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};