import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LegalCaseStatus } from "@/types/legal";

interface CaseWorkflowManagerProps {
  caseId: string;
  currentStatus: LegalCaseStatus;
  onStatusChange: () => void;
}

export const CaseWorkflowManager = ({
  caseId,
  currentStatus,
  onStatusChange,
}: CaseWorkflowManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getNextStatus = (currentStatus: LegalCaseStatus): LegalCaseStatus => {
    const workflow: Record<LegalCaseStatus, LegalCaseStatus> = {
      pending_reminder: "in_legal_process",
      in_legal_process: "escalated",
      escalated: "resolved",
      resolved: "resolved"
    };
    return workflow[currentStatus];
  };

  const getStatusAction = (status: LegalCaseStatus) => {
    const actions: Record<LegalCaseStatus, string> = {
      pending_reminder: "Start Legal Process",
      in_legal_process: "Escalate Case",
      escalated: "Mark as Resolved",
      resolved: "Case Resolved"
    };
    return actions[status];
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

      toast.success("Case status updated successfully");
      onStatusChange();
    } catch (error) {
      console.error("Error updating case status:", error);
      toast.error("Failed to update case status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: LegalCaseStatus) => {
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