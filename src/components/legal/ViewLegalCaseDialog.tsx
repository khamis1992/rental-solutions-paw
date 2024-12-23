import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type LegalCaseStatus = "pending_reminder" | "in_legal_process" | "resolved";

interface ViewLegalCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  currentStatus: LegalCaseStatus;
  notes: string;
  onStatusUpdate: () => void;
}

export function ViewLegalCaseDialog({ 
  isOpen,
  onClose,
  caseId,
  currentStatus,
  notes: initialNotes,
  onStatusUpdate
}: ViewLegalCaseDialogProps) {
  const [status, setStatus] = useState<LegalCaseStatus>(currentStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('legal_cases')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;

      toast.success('Legal case updated successfully');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating legal case:', error);
      toast.error('Failed to update legal case');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>View Legal Case</DialogTitle>
          <DialogDescription>
            View and update the status of this legal case.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value: LegalCaseStatus) => setStatus(value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending_reminder">Pending Reminder</SelectItem>
                <SelectItem value="in_legal_process">In Legal Process</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
