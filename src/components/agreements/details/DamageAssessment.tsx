import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DamageAssessmentProps {
  agreementId: string;
}

export const DamageAssessment = ({ agreementId }: DamageAssessmentProps) => {
  const [description, setDescription] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('damages')
        .insert({
          lease_id: agreementId,
          description,
          repair_cost: parseFloat(repairCost),
          status: 'reported'
        });

      if (error) throw error;

      toast.success('Damage report submitted successfully');
      setDescription("");
      setRepairCost("");
    } catch (error) {
      console.error('Error submitting damage report:', error);
      toast.error('Failed to submit damage report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Damage Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the damage..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="repairCost">Estimated Repair Cost (QAR)</Label>
        <Input
          id="repairCost"
          type="number"
          value={repairCost}
          onChange={(e) => setRepairCost(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Damage Report"}
      </Button>
    </form>
  );
};