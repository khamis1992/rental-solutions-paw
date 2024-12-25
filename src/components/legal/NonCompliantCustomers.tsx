import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

export const NonCompliantCustomers = () => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["non-compliant-customers"],
    queryFn: async () => {
      const { data: leases, error } = await supabase
        .from("leases")
        .select(`
          *,
          customer:profiles(
            id,
            full_name,
            email,
            phone_number
          ),
          payments(status),
          penalties(amount, status)
        `)
        .eq("status", "active");

      if (error) throw error;
      return leases.filter(lease => 
        lease.penalties.some(penalty => penalty.status === 'pending') ||
        lease.payments.some(payment => payment.status === 'overdue')
      );
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">Non-Compliant Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers?.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No non-compliant customers found
            </div>
          ) : (
            customers?.map((lease) => (
              <div
                key={lease.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-medium">{lease.customer.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {lease.customer.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {lease.customer.phone_number}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {lease.penalties.some(penalty => penalty.status === 'pending') && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Pending Penalties
                      </Badge>
                    )}
                    {lease.payments.some(payment => payment.status === 'overdue') && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Overdue Payments
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};