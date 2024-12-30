import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseStatusReport } from "./CaseStatusReport";
import { SettlementReport } from "./SettlementReport";
import { ComplianceReport } from "./ComplianceReport";
import { Loader2 } from "lucide-react";

export const LegalReportsDashboard = () => {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['legal-reports-data'],
    queryFn: async () => {
      const [casesResponse, settlementsResponse, complianceResponse] = await Promise.all([
        supabase.from('legal_cases').select('*'),
        supabase.from('legal_settlements').select('*'),
        supabase.from('legal_compliance_items').select('*')
      ]);

      return {
        cases: casesResponse.data || [],
        settlements: settlementsResponse.data || [],
        compliance: complianceResponse.data || []
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cases" className="space-y-4">
            <TabsList>
              <TabsTrigger value="cases">Case Reports</TabsTrigger>
              <TabsTrigger value="settlements">Settlement Reports</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="cases">
              <CaseStatusReport data={reportData?.cases || []} />
            </TabsContent>

            <TabsContent value="settlements">
              <SettlementReport data={reportData?.settlements || []} />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceReport data={reportData?.compliance || []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};