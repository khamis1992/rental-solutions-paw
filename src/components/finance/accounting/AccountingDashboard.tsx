import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueMonitoring } from "./sections/RevenueMonitoring";
import { ExpenseTracking } from "./sections/ExpenseTracking";
import { PayrollManagement } from "./sections/PayrollManagement";
import { RecentTransactions } from "./sections/RecentTransactions";
import { FinancialReports } from "./sections/FinancialReports";

export const AccountingDashboard = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueMonitoring />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseTracking />
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollManagement />
        </TabsContent>

        <TabsContent value="transactions">
          <RecentTransactions />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};