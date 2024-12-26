import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Plus, DollarSign } from "lucide-react";

export const PayrollManagement = () => {
  const { data: payrollData } = useQuery({
    queryKey: ["payroll"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll")
        .select(`
          *,
          employee:profiles(full_name)
        `)
        .order("pay_period_end", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payroll</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Process Payroll
        </Button>
      </div>

      <div className="grid gap-4">
        {payrollData?.map((payroll) => (
          <Card key={payroll.id}>
            <CardContent className="flex justify-between items-center p-6">
              <div className="space-y-1">
                <p className="font-medium">{payroll.employee.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  Period: {new Date(payroll.pay_period_start).toLocaleDateString()} -{" "}
                  {new Date(payroll.pay_period_end).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="font-medium">{formatCurrency(payroll.net_pay)}</p>
                <Button variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};