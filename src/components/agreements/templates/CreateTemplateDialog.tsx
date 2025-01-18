import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTemplateDialog = ({
  open,
  onOpenChange,
}: CreateTemplateDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agreement_type: "short_term",
    rent_amount: "",
    final_price: "",
    agreement_duration: "12",
    daily_late_fee: "120",
    damage_penalty_rate: "0",
    late_return_fee: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("agreement_templates").insert({
        ...formData,
        rent_amount: parseFloat(formData.rent_amount),
        final_price: parseFloat(formData.final_price),
        agreement_duration: `${formData.agreement_duration} months`,
        daily_late_fee: parseFloat(formData.daily_late_fee),
        damage_penalty_rate: parseFloat(formData.damage_penalty_rate),
        late_return_fee: parseFloat(formData.late_return_fee),
      });

      if (error) throw error;

      toast.success("Template created successfully");
      queryClient.invalidateQueries({ queryKey: ["agreement-templates"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Agreement Template</DialogTitle>
          <DialogDescription>
            Create a new template for lease agreements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreement_type">Agreement Type</Label>
              <Select
                value={formData.agreement_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, agreement_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_term">Short Term</SelectItem>
                  <SelectItem value="lease_to_own">Lease to Own</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent_amount">Rent Amount (QAR)</Label>
              <Input
                id="rent_amount"
                type="number"
                value={formData.rent_amount}
                onChange={(e) =>
                  setFormData({ ...formData, rent_amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="final_price">Final Price (QAR)</Label>
              <Input
                id="final_price"
                type="number"
                value={formData.final_price}
                onChange={(e) =>
                  setFormData({ ...formData, final_price: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreement_duration">Duration (Months)</Label>
              <Input
                id="agreement_duration"
                type="number"
                value={formData.agreement_duration}
                onChange={(e) =>
                  setFormData({ ...formData, agreement_duration: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_late_fee">Daily Late Fee (QAR)</Label>
              <Input
                id="daily_late_fee"
                type="number"
                value={formData.daily_late_fee}
                onChange={(e) =>
                  setFormData({ ...formData, daily_late_fee: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="damage_penalty_rate">Damage Penalty Rate</Label>
              <Input
                id="damage_penalty_rate"
                type="number"
                value={formData.damage_penalty_rate}
                onChange={(e) =>
                  setFormData({ ...formData, damage_penalty_rate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="late_return_fee">Late Return Fee</Label>
              <Input
                id="late_return_fee"
                type="number"
                value={formData.late_return_fee}
                onChange={(e) =>
                  setFormData({ ...formData, late_return_fee: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};