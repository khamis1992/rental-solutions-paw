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

export const VirtualCFO = () => {
  return (
    <Tabs defaultValue="profitability" className="space-y-6">
      <TabsList className="w-full justify-start bg-background border-b rounded-none p-0 h-auto">
        <div className="flex overflow-x-auto no-scrollbar">
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

      <TabsContent value="profitability" className="space-y-6">
        <ProfitabilityTracking />
      </TabsContent>

      <TabsContent value="costs" className="space-y-6">
        <CostAllocation />
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