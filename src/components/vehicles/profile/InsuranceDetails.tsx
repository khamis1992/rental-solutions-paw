import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
        // Update existing insurance
        const { error } = await supabase
          .from('vehicle_insurance')
          .update(formData)
          .eq('id', insurance.id);
        
        if (error) throw error;
      } else {
        // Create new insurance
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy_number">Policy Number</Label>
                <Input
                  id="policy_number"
                  value={formData.policy_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverage_type">Coverage Type</Label>
                <Input
                  id="coverage_type"
                  value={formData.coverage_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverage_type: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverage_amount">Coverage Amount</Label>
                <Input
                  id="coverage_amount"
                  type="number"
                  value={formData.coverage_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverage_amount: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium_amount">Premium Amount</Label>
                <Input
                  id="premium_amount"
                  type="number"
                  value={formData.premium_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, premium_amount: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="font-medium">Policy Number</dt>
              <dd>{insurance?.policy_number || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium">Provider</dt>
              <dd>{insurance?.provider || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium">Start Date</dt>
              <dd>{insurance?.start_date || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium">End Date</dt>
              <dd>{insurance?.end_date || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium">Coverage Type</dt>
              <dd>{insurance?.coverage_type || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium">Coverage Amount</dt>
              <dd>{insurance?.coverage_amount ? `${insurance.coverage_amount} QAR` : "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium">Premium Amount</dt>
              <dd>{insurance?.premium_amount ? `${insurance.premium_amount} QAR` : "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium">Status</dt>
              <dd className="capitalize">{insurance?.status || "Not set"}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
};