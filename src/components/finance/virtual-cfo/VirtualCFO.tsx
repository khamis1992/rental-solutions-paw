import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseAnalysis } from "./ExpenseAnalysis";
import { CashFlowMonitoring } from "./CashFlowMonitoring";
import { ScenarioAnalysis } from "./ScenarioAnalysis";
import { ProfitabilityTracking } from "./ProfitabilityTracking";
import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { CustomDashboard } from "./reporting/CustomDashboard";
import { ReportScheduler } from "./reporting/ReportScheduler";
import { PricingAnalysis } from "./PricingAnalysis";
import { BarChart3, FileSpreadsheet, Calculator } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Agreement } from "@/types/agreement.types";

export const VirtualCFO = () => {
  const { data: activeAgreements, isLoading } = useQuery({
    queryKey: ["active-rent-amounts"],
    queryFn: async () => {
      const { data: agreements, error } = await supabase
        .from("leases")
        .select(`
          id,
          agreement_number,
          agreement_type,
          customer_id,
          vehicle_id,
          start_date,
          end_date,
          status,
          total_amount,
          rent_amount
        `)
        .eq("status", "active")
        .order("agreement_number");

      if (error) throw error;
      return agreements as Agreement[];
    },
  });

  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList className="w-full justify-start bg-background border-b rounded-none p-0 h-auto">
        <div className="flex overflow-x-auto no-scrollbar">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          
          <TabsTrigger 
            value="reports" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Reports
          </TabsTrigger>
          
          <TabsTrigger 
            value="pricing" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Calculator className="h-4 w-4" />
            Pricing Analysis
          </TabsTrigger>
          
          <TabsTrigger value="profitability">
            Profitability
          </TabsTrigger>
          
          <TabsTrigger value="break-even">
            Break-Even
          </TabsTrigger>
          
          <TabsTrigger value="expense-analysis">
            Expense Analysis
          </TabsTrigger>
          
          <TabsTrigger value="cash-flow">
            Cash Flow
          </TabsTrigger>
          
          <TabsTrigger value="scenarios">
            Scenarios
          </TabsTrigger>
        </div>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
        <CustomDashboard />
      </TabsContent>

      <TabsContent value="reports">
        <ReportScheduler />
      </TabsContent>

      <TabsContent value="pricing">
        <PricingAnalysis />
      </TabsContent>

      <TabsContent value="profitability">
        <ProfitabilityTracking agreements={activeAgreements} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="break-even">
        <BreakEvenAnalysis agreements={activeAgreements} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="expense-analysis">
        <ExpenseAnalysis />
      </TabsContent>

      <TabsContent value="cash-flow">
        <CashFlowMonitoring />
      </TabsContent>

      <TabsContent value="scenarios">
        <ScenarioAnalysis />
      </TabsContent>
    </Tabs>
  );
};