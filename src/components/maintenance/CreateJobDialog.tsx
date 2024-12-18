import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function CreateJobDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    service_type: "",
    description: "",
    scheduled_date: "",
    performed_by: "",
    cost: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate vehicle_id format (must be a valid UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(formData.vehicle_id)) {
        throw new Error("Invalid vehicle ID format. Please use a valid UUID.");
      }

      const { error } = await supabase
        .from("maintenance")
        .insert([{
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          status: "scheduled", // Set default status
        }]);

      if (error) throw error;

      toast.success("Job card created successfully");
      setOpen(false);
      setFormData({
        vehicle_id: "",
        service_type: "",
        description: "",
        scheduled_date: "",
        performed_by: "",
        cost: "",
      });
    } catch (error: any) {
      console.error("Error creating job card:", error);
      toast.error(error.message || "Failed to create job card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Job Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">Vehicle ID</Label>
            <Input
              id="vehicle_id"
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              required
              placeholder="Enter valid UUID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Input
              id="service_type"
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Scheduled Date</Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="performed_by">Assigned To</Label>
            <Input
              id="performed_by"
              value={formData.performed_by}
              onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Job Card"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}