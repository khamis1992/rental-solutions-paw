import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Users, WalletCards, FileSpreadsheet, DollarSign } from "lucide-react";

export const PayrollManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["payroll-data"],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .eq("type", "EXPENSE")
        .eq("cost_type", "payroll")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return transactions;
    },
  });

  const totalPayroll = payrollData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
  const averagePayroll = payrollData?.length ? totalPayroll / payrollData.length : 0;
  const lastMonthPayroll = totalPayroll * 0.95; // Simulated previous month data
  const payrollGrowth = ((totalPayroll - lastMonthPayroll) / lastMonthPayroll) * 100;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard
          title="Total Payroll"
          value={formatCurrency(totalPayroll)}
          icon={DollarSign}
          description={`${payrollGrowth.toFixed(1)}% from last month`}
          className="bg-white"
        />
        <StatsCard
          title="Average Salary"
          value={formatCurrency(averagePayroll)}
          icon={WalletCards}
          description="Per employee"
          className="bg-white"
        />
        <StatsCard
          title="Active Employees"
          value="24"
          icon={Users}
          description="+2 this month"
          className="bg-white"
        />
        <StatsCard
          title="Pending Payments"
          value="3"
          icon={FileSpreadsheet}
          description="Due this week"
          className="bg-white"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={payrollData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="transaction_date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#8884d8" 
                      name="Payroll Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                Employee management interface will be implemented in the next phase.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                Payment processing interface will be implemented in the next phase.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                Reporting interface will be implemented in the next phase.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};