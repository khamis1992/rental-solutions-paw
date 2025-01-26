import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseAnalysis } from "./ExpenseAnalysis";
import { BudgetingAssistance } from "./BudgetingAssistance";
import { CashFlowMonitoring } from "./CashFlowMonitoring";
import { ScenarioAnalysis } from "./ScenarioAnalysis";
import { FinancialGoals } from "./FinancialGoals";
import { ProfitabilityTracking } from "./ProfitabilityTracking";
import { CostAllocation } from "./CostAllocation";
import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { FinancialHealth } from "./FinancialHealth";
import { BudgetOptimization } from "./BudgetOptimization";
import { CustomDashboard } from "./reporting/CustomDashboard";
import { ReportScheduler } from "./reporting/ReportScheduler";
import { BarChart3, FileSpreadsheet } from "lucide-react";

export const VirtualCFO = () => {
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
            value="profitability" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Profitability
          </TabsTrigger>
          <TabsTrigger 
            value="costs" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="budget-optimization" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Budget Optimization
          </TabsTrigger>
          <TabsTrigger 
            value="break-even" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Break-Even
          </TabsTrigger>
          <TabsTrigger 
            value="health" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Financial Health
          </TabsTrigger>
          <TabsTrigger 
            value="expense-analysis" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Expense Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="budgeting" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Budgeting
          </TabsTrigger>
          <TabsTrigger 
            value="cash-flow" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Cash Flow
          </TabsTrigger>
          <TabsTrigger 
            value="scenarios" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Scenarios
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Goals
          </TabsTrigger>
        </div>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
        <CustomDashboard />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportScheduler />
        </div>
      </TabsContent>

      <TabsContent value="profitability" className="space-y-6">
        <ProfitabilityTracking />
      </TabsContent>

      <TabsContent value="costs" className="space-y-6">
        <CostAllocation />
      </TabsContent>

      <TabsContent value="budget-optimization" className="space-y-6">
        <BudgetOptimization />
      </TabsContent>

      <TabsContent value="break-even" className="space-y-6">
        <BreakEvenAnalysis />
      </TabsContent>

      <TabsContent value="health" className="space-y-6">
        <FinancialHealth />
      </TabsContent>

      <TabsContent value="expense-analysis" className="space-y-6">
        <ExpenseAnalysis />
      </TabsContent>

      <TabsContent value="budgeting" className="space-y-6">
        <BudgetingAssistance />
      </TabsContent>

      <TabsContent value="cash-flow" className="space-y-6">
        <CashFlowMonitoring />
      </TabsContent>

      <TabsContent value="scenarios" className="space-y-6">
        <ScenarioAnalysis />
      </TabsContent>

      <TabsContent value="goals" className="space-y-6">
        <FinancialGoals />
      </TabsContent>
    </Tabs>
  );
};
