import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { AiAccountantDashboard } from "@/components/finance/ai-accountant/AiAccountantDashboard";
import { RentManagementSection } from "@/components/finance/rent/RentManagementSection";

const Finance = () => {
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["financial-data"],
    queryFn: async () => {
      const { data: expenseData, error: expenseError } = await supabase
        .from("expense_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (expenseError) {
        console.error("Error fetching expense data:", expenseError);
        throw expenseError;
      }

      const { data: revenueData, error: revenueError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (revenueError) {
        console.error("Error fetching revenue data:", revenueError);
        throw revenueError;
      }

      return {
        expenses: expenseData || [],
        revenue: revenueData || []
      };
    }
  });

  if (isLoadingFinancial) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const totalRevenue = financialData?.revenue.reduce((sum, payment) => {
    if (payment.status === "completed") {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0) || 0;

  const totalExpenses = financialData?.expenses.reduce((sum, expense) => {
    return sum + (expense.amount || 0);
  }, 0) || 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 p-6">
        <h1 className="text-4xl font-bold tracking-tight">Financial Management</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(totalRevenue - totalExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rent">Rent Management</TabsTrigger>
            <TabsTrigger value="ai-accountant">AI Accountant</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {financialData?.expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{expense.description || 'Unnamed Expense'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(expense.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {financialData?.revenue.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Payment {payment.transaction_id || payment.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(payment.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rent">
            <RentManagementSection />
          </TabsContent>

          <TabsContent value="ai-accountant">
            <AiAccountantDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finance;