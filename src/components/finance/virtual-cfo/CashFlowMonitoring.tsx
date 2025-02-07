
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CashFlowAlert {
  id: string;
  alert_type: string;
  message: string;
  severity: string;
  threshold_amount: number;
  current_amount: number;
  payment_id: string | null;
  expected_amount: number;
  status: string;
  created_at: string;
}

export const CashFlowMonitoring = () => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["cash-flow-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_flow_alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CashFlowAlert[];
    },
  });

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          containerClass: "border-red-200 bg-red-50 dark:bg-red-900/10",
          iconClass: "text-red-600",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        };
      case "medium":
        return {
          containerClass: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10",
          iconClass: "text-yellow-600",
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        };
      default:
        return {
          containerClass: "border-blue-200 bg-blue-50 dark:bg-blue-900/10",
          iconClass: "text-blue-600",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "upcoming_payment":
        return CalendarClock;
      case "threshold_breach":
        return AlertTriangle;
      default:
        return DollarSign;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cash Flow Alerts</CardTitle>
        <Badge variant="outline" className="ml-2">
          {alerts?.length || 0} Active Alerts
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {alerts?.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const AlertIcon = getAlertIcon(alert.alert_type);

              return (
                <Alert
                  key={alert.id}
                  className={`transition-all duration-200 ${styles.containerClass}`}
                >
                  <AlertIcon className={`h-5 w-5 ${styles.iconClass}`} />
                  <div className="flex-1 space-y-2">
                    <AlertTitle className="flex items-center gap-2">
                      {alert.alert_type === "upcoming_payment" ? "Upcoming Payment Due" : "Cash Flow Alert"}
                      <Badge variant="outline" className={styles.badge}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      <div className="grid gap-1">
                        <p>{alert.message}</p>
                        {alert.expected_amount > 0 && (
                          <p className="text-sm font-medium">
                            Expected Amount: {formatCurrency(alert.expected_amount)}
                            {alert.current_amount > 0 && (
                              <span className="ml-2 text-green-600">
                                (Paid: {formatCurrency(alert.current_amount)})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              );
            })}
            {!alerts?.length && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">No Active Alerts</p>
                <p className="text-sm">Your cash flow is looking healthy!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
