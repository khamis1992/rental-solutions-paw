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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash, Plus, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type VehicleStatus = Database["public"]["Tables"]["vehicle_statuses"]["Row"];

export const VehicleStatusSettings = () => {
  const [statuses, setStatuses] = useState<VehicleStatus[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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

  const updateStatus = async (id: string) => {
    if (!editValue.trim()) return;

    const { error } = await supabase
      .from("vehicle_statuses")
      .update({ name: editValue.trim() })
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

    setEditingId(null);
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status Name</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((status) => (
              <TableRow key={status.id}>
                <TableCell>
                  {editingId === status.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-[200px]"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateStatus(status.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    status.name
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant={status.is_active ? "default" : "secondary"}
                    onClick={() => toggleStatus(status.id, status.is_active || false)}
                  >
                    {status.is_active ? "Active" : "Inactive"}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(status.id);
                      setEditValue(status.name);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};