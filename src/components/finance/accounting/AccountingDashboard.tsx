import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueMonitoring } from "./sections/RevenueMonitoring";
import { ExpenseTracking } from "./sections/ExpenseTracking";
import { PayrollManagement } from "./sections/PayrollManagement";
import { RecentTransactions } from "./sections/RecentTransactions";
import { FinancialReports } from "./sections/FinancialReports";

export const AccountingDashboard = () => {
  return (
    <Tabs defaultValue="revenue" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="payroll">Payroll</TabsTrigger>
        <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        <TabsTrigger value="reports">Financial Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue" className="space-y-4">
        <RevenueMonitoring />
      </TabsContent>

      <TabsContent value="expenses" className="space-y-4">
        <ExpenseTracking />
      </TabsContent>

      <TabsContent value="payroll" className="space-y-4">
        <PayrollManagement />
      </TabsContent>

      <TabsContent value="transactions" className="space-y-4">
        <RecentTransactions />
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <FinancialReports />
      </TabsContent>
    </Tabs>
  );
};