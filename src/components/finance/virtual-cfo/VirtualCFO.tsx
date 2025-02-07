
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseAnalysis } from "./ExpenseAnalysis";
import { CashFlowMonitoring } from "./CashFlowMonitoring";
import { ScenarioAnalysis } from "./ScenarioAnalysis";
import { ProfitabilityTracking } from "./ProfitabilityTracking";
import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { CustomDashboard } from "./reporting/CustomDashboard";
import { ReportScheduler } from "./reporting/ReportScheduler";
import { PricingAnalysis } from "./PricingAnalysis";
import { 
  BarChart3, 
  FileSpreadsheet, 
  Calculator, 
  TrendingUp,
  DollarSign,
  LineChart,
  PieChart,
  Briefcase
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Agreement } from "@/types/agreement.types";
import { QuickInsights } from "./QuickInsights";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      <QuickInsights agreements={activeAgreements} isLoading={isLoading} />
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList 
          className="w-full justify-start bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 
                     border-b rounded-none p-0 h-auto sticky top-0 z-10"
        >
          <div className="flex overflow-x-auto no-scrollbar">
            <TabsTrigger 
              value="dashboard" 
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-purple-100",
                "data-[state=active]:dark:from-purple-900/50 data-[state=active]:dark:to-purple-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            
            <TabsTrigger 
              value="reports" 
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-blue-100",
                "data-[state=active]:dark:from-blue-900/50 data-[state=active]:dark:to-blue-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none"
              )}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Reports
            </TabsTrigger>
            
            <TabsTrigger 
              value="pricing" 
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-50 data-[state=active]:to-green-100",
                "data-[state=active]:dark:from-green-900/50 data-[state=active]:dark:to-green-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none"
              )}
            >
              <Calculator className="h-4 w-4" />
              Pricing Analysis
            </TabsTrigger>
            
            <TabsTrigger 
              value="profitability"
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-50 data-[state=active]:to-yellow-100",
                "data-[state=active]:dark:from-yellow-900/50 data-[state=active]:dark:to-yellow-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Profitability
            </TabsTrigger>
            
            <TabsTrigger 
              value="break-even"
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-50 data-[state=active]:to-orange-100",
                "data-[state=active]:dark:from-orange-900/50 data-[state=active]:dark:to-orange-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none"
              )}
            >
              <DollarSign className="h-4 w-4" />
              Break-Even
            </TabsTrigger>
            
            <TabsTrigger 
              value="expense-analysis"
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-50 data-[state=active]:to-red-100",
                "data-[state=active]:dark:from-red-900/50 data-[state=active]:dark:to-red-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none"
              )}
            >
              <PieChart className="h-4 w-4" />
              Expense Analysis
            </TabsTrigger>
            
            <TabsTrigger 
              value="cash-flow"
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-50 data-[state=active]:to-indigo-100",
                "data-[state=active]:dark:from-indigo-900/50 data-[state=active]:dark:to-indigo-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none"
              )}
            >
              <LineChart className="h-4 w-4" />
              Cash Flow
            </TabsTrigger>
            
            <TabsTrigger 
              value="scenarios"
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-50 data-[state=active]:to-pink-100",
                "data-[state=active]:dark:from-pink-900/50 data-[state=active]:dark:to-pink-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none"
              )}
            >
              <Briefcase className="h-4 w-4" />
              Scenarios
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
          <CustomDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 animate-fade-in">
          <ReportScheduler />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6 animate-fade-in">
          <PricingAnalysis />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6 animate-fade-in">
          <ProfitabilityTracking agreements={activeAgreements} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="break-even" className="space-y-6 animate-fade-in">
          <BreakEvenAnalysis agreements={activeAgreements} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="expense-analysis" className="space-y-6 animate-fade-in">
          <ExpenseAnalysis />
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6 animate-fade-in">
          <CashFlowMonitoring />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6 animate-fade-in">
          <ScenarioAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};
