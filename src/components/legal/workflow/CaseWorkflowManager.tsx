import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CaseWorkflowManagerProps {
  caseId: string;
  currentStatus: string;
  onStatusChange: () => void;
}

export const CaseWorkflowManager = ({
  caseId,
  currentStatus,
  onStatusChange,
}: CaseWorkflowManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getNextStatus = (currentStatus: string) => {
    const workflow = {
      pending_reminder: "in_legal_process",
      in_legal_process: "escalated",
      escalated: "resolved",
    };
    return workflow[currentStatus as keyof typeof workflow] || currentStatus;
  };

  const getStatusAction = (status: string) => {
    const actions = {
      pending_reminder: "Start Legal Process",
      in_legal_process: "Escalate Case",
      escalated: "Mark as Resolved",
    };
    return actions[status as keyof typeof actions] || "Update Status";
  };

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    const nextStatus = getNextStatus(currentStatus);

    try {
      const { error } = await supabase
        .from("legal_cases")
        .update({ status: nextStatus })
        .eq("id", caseId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Case status has been updated to ${nextStatus.replace(/_/g, " ")}`,
      });
      onStatusChange();
    } catch (error) {
      console.error("Error updating case status:", error);
      toast({
        title: "Error",
        description: "Failed to update case status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "escalated":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const isWorkflowComplete = currentStatus === "resolved";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Workflow Management
          {getStatusIcon(currentStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current Status</p>
            <p className="text-sm text-muted-foreground">
              {currentStatus.replace(/_/g, " ")}
            </p>
          </div>
          {!isWorkflowComplete && (
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || isWorkflowComplete}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                getStatusAction(currentStatus)
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};