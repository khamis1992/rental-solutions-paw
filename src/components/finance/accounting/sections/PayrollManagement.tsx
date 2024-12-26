import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export const PayrollManagement = () => {
  const { data: payrollData } = useQuery({
    queryKey: ["payroll-management"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll")
        .select(`
          *,
          profiles:employee_id (
            full_name
          )
        `)
        .order("pay_period_start", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollData?.map((payroll) => (
              <div key={payroll.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <p className="font-medium">{payroll.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payroll.pay_period_start).toLocaleDateString()} - 
                    {new Date(payroll.pay_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(payroll.net_pay)}</p>
                  <p className="text-sm text-muted-foreground">{payroll.payment_status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};