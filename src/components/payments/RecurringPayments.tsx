import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Calendar, DollarSign, Edit, Trash, Check, X } from "lucide-react";
import { RecurringPaymentsList } from "./RecurringPaymentsList";
import { RecurringPaymentForm } from "./RecurringPaymentForm";

export function RecurringPayments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: recurringPayments, isLoading } = useQuery({
    queryKey: ["recurring-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          leases (
            agreement_number,
            customer_id,
            profiles:customer_id (
              id,
              full_name
            )
          )
        `)
        .eq("is_recurring", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recurring Payments</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              New Recurring Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Set Up Recurring Payment</DialogTitle>
              <DialogDescription>
                Configure a new recurring payment for a customer.
              </DialogDescription>
            </DialogHeader>
            <RecurringPaymentForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <RecurringPaymentsList payments={recurringPayments || []} />
      )}
    </div>
  );
}