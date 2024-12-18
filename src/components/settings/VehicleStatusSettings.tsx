import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusList } from "./status/StatusList";

export const VehicleStatusSettings = () => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();

  const loadStatuses = async () => {
    const { data, error } = await supabase
      .from("vehicle_statuses")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load vehicle statuses",
        variant: "destructive",
      });
      return;
    }

    setStatuses(data);
  };

  const addStatus = async () => {
    if (!newStatus.trim()) return;

    const { error } = await supabase
      .from("vehicle_statuses")
      .insert([{ name: newStatus.trim(), is_active: true }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Status added successfully",
    });

    setNewStatus("");
    loadStatuses();
  };

  const updateStatus = async (id: string, name: string) => {
    if (!name.trim()) return;

    const { error } = await supabase
      .from("vehicle_statuses")
      .update({ name: name.trim() })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Status updated successfully",
    });

    loadStatuses();
  };

  const toggleStatus = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("vehicle_statuses")
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to toggle status",
        variant: "destructive",
      });
      return;
    }

    loadStatuses();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Status Management</CardTitle>
        <CardDescription>
          Add, edit, or deactivate vehicle status options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="New status name"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />
          <Button onClick={addStatus}>
            <Plus className="w-4 h-4 mr-2" />
            Add Status
          </Button>
        </div>

        <StatusList
          statuses={statuses}
          onUpdate={updateStatus}
          onToggle={toggleStatus}
        />
      </CardContent>
    </Card>
  );
};