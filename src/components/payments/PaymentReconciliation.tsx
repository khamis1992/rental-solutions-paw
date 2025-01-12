import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PaymentReconciliationTable } from "./PaymentReconciliationTable";
import { Loader2 } from "lucide-react";

export const PaymentReconciliation = () => {
  const queryClient = useQueryClient();

  const { data: unreconciled, isLoading } = useQuery({
    queryKey: ["unreconciled-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unified_payments")
        .select(`
          *,
          lease:leases (
            agreement_number,
            customer_id,
            profiles:customer_id (
              id,
              full_name,
              phone_number
            )
          )
        `)
        .eq("reconciliation_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleReconcileAll = async () => {
    try {
      const { error } = await supabase
        .from("unified_payments")
        .update({ 
          reconciliation_status: "completed",
          reconciliation_date: new Date().toISOString()
        })
        .eq("reconciliation_status", "pending");

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["unreconciled-payments"] });
      toast.success("All payments have been reconciled");
    } catch (error) {
      console.error("Error reconciling payments:", error);
      toast.error("Failed to reconcile payments");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Payment Reconciliation</CardTitle>
        <Button 
          onClick={handleReconcileAll}
          disabled={!unreconciled?.length}
        >
          Reconcile All
        </Button>
      </CardHeader>
      <CardContent>
        <PaymentReconciliationTable payments={unreconciled || []} />
      </CardContent>
    </Card>
  );
};