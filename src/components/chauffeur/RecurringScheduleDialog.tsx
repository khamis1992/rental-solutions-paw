import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const RecurringScheduleDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheduleType: "pickup",
    recurrencePattern: "daily",
    recurrenceInterval: 1,
    startDate: "",
    endDate: "",
    locationAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("recurring_schedules").insert([
        {
          schedule_type: formData.scheduleType,
          recurrence_pattern: formData.recurrencePattern,
          recurrence_interval: formData.recurrenceInterval,
          start_date: formData.startDate,
          end_date: formData.endDate,
          location_address: formData.locationAddress,
        },
      ]);

      if (error) throw error;

      toast.success("Recurring schedule created successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error creating recurring schedule:", error);
      toast.error("Failed to create recurring schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Recurring Schedule</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Recurring Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduleType">Schedule Type</Label>
            <Select
              value={formData.scheduleType}
              onValueChange={(value) =>
                setFormData({ ...formData, scheduleType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="dropoff">Dropoff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
            <Select
              value={formData.recurrencePattern}
              onValueChange={(value) =>
                setFormData({ ...formData, recurrencePattern: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrenceInterval">Recurrence Interval</Label>
            <Input
              type="number"
              min="1"
              value={formData.recurrenceInterval}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recurrenceInterval: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationAddress">Location Address</Label>
            <Input
              value={formData.locationAddress}
              onChange={(e) =>
                setFormData({ ...formData, locationAddress: e.target.value })
              }
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Schedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};