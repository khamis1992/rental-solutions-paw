import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ImportActionsProps {
  importId: string;
  onAssigned?: () => void;
  disabled?: boolean;
}

export const ImportActions = ({ importId, onAssigned, disabled }: ImportActionsProps) => {
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  const handleAutoAssign = async () => {
    try {
      setIsAutoAssigning(true);
      
      const { data, error } = await supabase.functions.invoke('auto-assign-transactions', {
        body: { importId }
      });

      if (error) throw error;

      toast.success(
        `Auto-assigned ${data.assigned} out of ${data.total} transactions`, 
        { description: "You can review the assignments in the transactions list" }
      );

      onAssigned?.();
    } catch (error) {
      console.error('Auto-assign error:', error);
      toast.error('Failed to auto-assign transactions');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="secondary"
        onClick={handleAutoAssign}
        disabled={disabled || isAutoAssigning}
      >
        {isAutoAssigning ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        Auto Assign
      </Button>
    </div>
  );
};