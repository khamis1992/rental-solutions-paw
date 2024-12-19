import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RentManagementProps {
  agreementId: string;
  initialRentAmount?: number;
  initialRentDueDay?: number;
}

export const RentManagement = ({ 
  agreementId, 
  initialRentAmount = 0,
  initialRentDueDay = 1
}: RentManagementProps) => {
  const [rentAmount, setRentAmount] = useState(initialRentAmount);
  const [rentDueDay, setRentDueDay] = useState(initialRentDueDay);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('leases')
        .update({
          rent_amount: rentAmount,
          rent_due_day: rentDueDay
        })
        .eq('id', agreementId);

      if (error) throw error;

      toast.success("Rent details updated successfully");
    } catch (error) {
      console.error('Error updating rent details:', error);
      toast.error("Failed to update rent details");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rentAmount">Monthly Rent Amount</Label>
          <Input
            id="rentAmount"
            type="number"
            min="0"
            step="0.01"
            value={rentAmount}
            onChange={(e) => setRentAmount(Number(e.target.value))}
            placeholder="Enter monthly rent amount"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rentDueDay">Rent Due Day</Label>
          <Input
            id="rentDueDay"
            type="number"
            min="1"
            max="31"
            value={rentDueDay}
            onChange={(e) => setRentDueDay(Number(e.target.value))}
            placeholder="Day of month (1-31)"
          />
        </div>
      </div>
      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Updating..." : "Update Rent Details"}
      </Button>
    </form>
  );
};