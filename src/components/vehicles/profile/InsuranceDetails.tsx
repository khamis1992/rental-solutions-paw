import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { InsuranceForm } from "./insurance/InsuranceForm";
import { InsuranceDisplay } from "./insurance/InsuranceDisplay";

interface InsuranceDetailsProps {
  vehicleId: string;
  insurance?: {
    id: string;
    policy_number: string;
    provider: string;
    start_date: string;
    end_date: string;
    coverage_type: string;
    coverage_amount: number;
    premium_amount: number;
    status: string;
  };
}

export const InsuranceDetails = ({ vehicleId, insurance }: InsuranceDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    policy_number: insurance?.policy_number || "",
    provider: insurance?.provider || "",
    start_date: insurance?.start_date || "",
    end_date: insurance?.end_date || "",
    coverage_type: insurance?.coverage_type || "",
    coverage_amount: insurance?.coverage_amount || 0,
    premium_amount: insurance?.premium_amount || 0,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (insurance?.id) {
        const { error } = await supabase
          .from('vehicle_insurance')
          .update(formData)
          .eq('id', insurance.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vehicle_insurance')
          .insert([{ vehicle_id: vehicleId, ...formData }]);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Insurance information has been updated",
      });
      
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update insurance information",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Insurance Details</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <InsuranceForm formData={formData} setFormData={setFormData} />
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        ) : (
          <InsuranceDisplay insurance={insurance} />
        )}
      </CardContent>
    </Card>
  );
};