import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseAnalysis } from "./ExpenseAnalysis";
import { BudgetingAssistance } from "./BudgetingAssistance";
import { CashFlowMonitoring } from "./CashFlowMonitoring";
import { ScenarioAnalysis } from "./ScenarioAnalysis";
import { FinancialGoals } from "./FinancialGoals";

export const VirtualCFO = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Virtual CFO Assistant</h2>
      </div>

      <Tabs defaultValue="expense-analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expense-analysis">Expense Analysis</TabsTrigger>
          <TabsTrigger value="budgeting">Budgeting</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
          <TabsTrigger value="goals">Financial Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="expense-analysis">
          <ExpenseAnalysis />
        </TabsContent>

        <TabsContent value="budgeting">
          <BudgetingAssistance />
        </TabsContent>

        <TabsContent value="cash-flow">
          <CashFlowMonitoring />
        </TabsContent>

        <TabsContent value="scenarios">
          <ScenarioAnalysis />
        </TabsContent>

        <TabsContent value="goals">
          <FinancialGoals />
        </TabsContent>
      </Tabs>
    </div>
  );
};