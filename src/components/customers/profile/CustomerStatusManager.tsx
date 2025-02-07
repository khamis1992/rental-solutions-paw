
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { value: "suspended", label: "Suspended", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "pending_review", label: "Pending Review", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "blacklisted", label: "Blacklisted", color: "bg-red-100 text-red-800 border-red-200" },
];

interface CustomerStatusManagerProps {
  profile: any;
}

export const CustomerStatusManager = ({ profile }: CustomerStatusManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(profile.status || "pending_review");
  const [statusNotes, setStatusNotes] = useState(profile.status_notes || "");
  const queryClient = useQueryClient();

  const getCurrentStatusColor = () => {
    return statusOptions.find(status => status.value === profile.status)?.color || statusOptions[0].color;
  };

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: newStatus,
          status_notes: statusNotes,
          status_updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success("Customer status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customer", profile.id] });
    } catch (error: any) {
      console.error('Error updating customer status:', error);
      toast.error(error.message || "Failed to update customer status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Customer Status</CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "ml-2",
              getCurrentStatusColor()
            )}
          >
            {profile.status?.replace('_', ' ') || 'N/A'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Update Status</label>
          <Select
            value={newStatus}
            onValueChange={setNewStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status Notes</label>
          <Textarea
            placeholder="Add notes about this status change..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleStatusUpdate} 
          disabled={isUpdating || (newStatus === profile.status && statusNotes === profile.status_notes)}
        >
          {isUpdating ? "Updating..." : "Update Status"}
        </Button>
      </CardContent>
    </Card>
  );
};
