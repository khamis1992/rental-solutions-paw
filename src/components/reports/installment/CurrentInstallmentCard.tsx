import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CurrentInstallmentCard = () => {
  const { data: currentInstallments, isLoading } = useQuery({
    queryKey: ["current-installments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_schedules")
        .select(`
          *,
          lease:leases (
            agreement_number,
            monthly_payment,
            total_amount,
            customer:profiles (
              full_name
            )
          )
        `)
        .gte('due_date', new Date().toISOString())
        .order('due_date')
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Installments</CardTitle>
      </CardHeader>
      <CardContent>
        {currentInstallments?.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No upcoming installments found.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {currentInstallments?.map((installment) => (
              <div
                key={installment.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    Agreement #{installment.lease.agreement_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {installment.lease.customer.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(installment.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(installment.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};