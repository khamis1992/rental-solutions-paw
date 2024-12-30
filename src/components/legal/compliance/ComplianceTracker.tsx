import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComplianceList } from "./ComplianceList";
import { ComplianceStats } from "./ComplianceStats";

export const ComplianceTracker = () => {
  const { data: complianceItems, isLoading } = useQuery({
    queryKey: ["legal-compliance-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_compliance_items")
        .select(`
          *,
          case:legal_cases (
            id,
            customer:profiles (
              full_name
            )
          )
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <ComplianceStats items={complianceItems || []} />
      <Card>
        <CardHeader>
          <CardTitle>Compliance Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplianceList items={complianceItems || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};