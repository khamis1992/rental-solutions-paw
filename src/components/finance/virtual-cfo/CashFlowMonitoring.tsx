import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export const CashFlowMonitoring = () => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["cash-flow-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_flow_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading cash flow alerts...</div>;
  }

  const getAlertVariant = (severity: string): "default" | "destructive" => {
    return severity === "high" ? "destructive" : "default";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts?.map((alert) => (
              <Alert
                key={alert.id}
                variant={getAlertVariant(alert.severity)}
              >
                <AlertDescription>
                  {alert.message}
                  {alert.current_amount && (
                    <div className="mt-2 font-semibold">
                      Current Amount: {formatCurrency(alert.current_amount)}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
            {!alerts?.length && (
              <p className="text-muted-foreground">No cash flow alerts at this time.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};