import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface VehicleInsuranceProps {
  vehicleId: string;
}

export const VehicleInsurance = ({ vehicleId }: VehicleInsuranceProps) => {
  const { data: insurance, isLoading } = useQuery({
    queryKey: ['vehicle-insurance', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_insurance')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading insurance details...</div>;
  }

  if (!insurance) {
    return <div>No insurance information available</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Policy Number</Label>
            <p className="text-lg font-medium">{insurance.policy_number}</p>
          </div>
          <div>
            <Label>Provider</Label>
            <p className="text-lg font-medium">{insurance.provider}</p>
          </div>
          <div>
            <Label>Coverage Type</Label>
            <p>{insurance.coverage_type}</p>
          </div>
          <div>
            <Label>Coverage Amount</Label>
            <p>${insurance.coverage_amount.toLocaleString()}</p>
          </div>
          <div>
            <Label>Premium Amount</Label>
            <p>${insurance.premium_amount.toLocaleString()}</p>
          </div>
          <div>
            <Label>Status</Label>
            <p className="capitalize">{insurance.status}</p>
          </div>
          <div>
            <Label>Start Date</Label>
            <p>{format(new Date(insurance.start_date), 'PP')}</p>
          </div>
          <div>
            <Label>End Date</Label>
            <p>{format(new Date(insurance.end_date), 'PP')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};