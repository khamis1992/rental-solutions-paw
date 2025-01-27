import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditMaintenanceDialogProps {
  record: {
    id: string;
    service_type: string;
    description?: string;
    status: "scheduled" | "in_progress" | "completed" | "cancelled";
    cost?: number;
    scheduled_date: string;
    notes?: string;
  };
}

export function EditMaintenanceDialog({ record }: EditMaintenanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    service_type: record.service_type,
    description: record.description || "",
    status: record.status,
    cost: record.cost || 0,
    scheduled_date: record.scheduled_date,
    notes: record.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("maintenance")
        .update({
          service_type: formData.service_type,
          description: formData.description,
          status: formData.status,
          cost: formData.cost,
          scheduled_date: formData.scheduled_date,
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", record.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance record updated successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error updating maintenance record:", error);
      toast.error("Failed to update maintenance record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Maintenance Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Input
              id="service_type"
              value={formData.service_type}
              onChange={(e) =>
                setFormData({ ...formData, service_type: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "scheduled" | "in_progress" | "completed" | "cancelled") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              type="number"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Scheduled Date</Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}