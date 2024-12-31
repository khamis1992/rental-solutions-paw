import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomReportBuilder } from "./CustomReportBuilder";
import { CaseStatusReport } from "./CaseStatusReport";
import { ComplianceReport } from "./ComplianceReport";
import { SettlementReport } from "./SettlementReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const LegalReportsDashboard = () => {
  // Fetch case status data
  const { data: caseStatusData, isLoading: isLoadingCaseStatus } = useQuery({
    queryKey: ["case-status-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_cases")
        .select("*");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch compliance data
  const { data: complianceData, isLoading: isLoadingCompliance } = useQuery({
    queryKey: ["compliance-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_compliance_items")
        .select("*");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch settlement data
  const { data: settlementData, isLoading: isLoadingSettlement } = useQuery({
    queryKey: ["settlement-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_settlements")
        .select("*");
      
      if (error) throw error;
      return data || [];
    }
  });

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="custom" className="space-y-6">
        <TabsList>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="status">Status Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="settlement">Settlement Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="custom">
          <CustomReportBuilder />
        </TabsContent>

        <TabsContent value="status">
          {isLoadingCaseStatus ? (
            renderLoadingSkeleton()
          ) : (
            <CaseStatusReport data={caseStatusData || []} />
          )}
        </TabsContent>

        <TabsContent value="compliance">
          {isLoadingCompliance ? (
            renderLoadingSkeleton()
          ) : (
            <ComplianceReport data={complianceData || []} />
          )}
        </TabsContent>

        <TabsContent value="settlement">
          {isLoadingSettlement ? (
            renderLoadingSkeleton()
          ) : (
            <SettlementReport data={settlementData || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};