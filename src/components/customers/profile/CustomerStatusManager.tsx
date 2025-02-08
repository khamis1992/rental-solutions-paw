
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
import { 
  CheckCircle, 
  XCircle, 
  AlertOctagon, 
  Clock, 
  ShieldAlert,
  Loader2,
  Edit2
} from "lucide-react";

const statusOptions = [
  { 
    value: "active", 
    label: "Active", 
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle
  },
  { 
    value: "inactive", 
    label: "Inactive", 
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: XCircle
  },
  { 
    value: "suspended", 
    label: "Suspended", 
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertOctagon
  },
  { 
    value: "pending_review", 
    label: "Pending Review", 
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock
  },
  { 
    value: "blacklisted", 
    label: "Blacklisted", 
    color: "bg-red-100 text-red-800 border-red-200",
    icon: ShieldAlert
  },
];

interface CustomerStatusManagerProps {
  profile: any;
}

export const CustomerStatusManager = ({ profile }: CustomerStatusManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(profile.status || "pending_review");
  const [statusNotes, setStatusNotes] = useState(profile.status_notes || "");
  const queryClient = useQueryClient();

  const getCurrentStatusColor = () => {
    return statusOptions.find(status => status.value === profile.status)?.color || statusOptions[0].color;
  };

  const getCurrentStatusIcon = () => {
    const StatusIcon = statusOptions.find(status => status.value === profile.status)?.icon || Clock;
    return <StatusIcon className="h-4 w-4" />;
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
      setIsEditing(false);
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
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "ml-2 flex items-center gap-2 transition-all duration-200",
                getCurrentStatusColor(),
                isEditing ? "opacity-50" : "opacity-100"
              )}
            >
              {getCurrentStatusIcon()}
              <span>{profile.status?.replace('_', ' ') || 'N/A'}</span>
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 transition-all duration-200",
                isEditing ? "bg-primary/10 text-primary" : ""
              )}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(
        "space-y-4 transition-all duration-200",
        isEditing ? "opacity-100" : "opacity-0 pointer-events-none h-0 !mt-0"
      )}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Update Status</label>
          <Select
            value={newStatus}
            onValueChange={setNewStatus}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem 
                  key={status.value} 
                  value={status.value}
                  className="flex items-center gap-2"
                >
                  <status.icon className="h-4 w-4" />
                  <span>{status.label}</span>
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
            disabled={isUpdating}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            disabled={isUpdating || (newStatus === profile.status && statusNotes === profile.status_notes)}
            className="flex-1"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
