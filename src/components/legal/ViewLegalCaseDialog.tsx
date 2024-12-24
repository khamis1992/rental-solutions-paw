import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LegalCaseStatus } from "@/types/legal";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ViewLegalCaseDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewLegalCaseDialog = ({ caseId, open, onOpenChange }: ViewLegalCaseDialogProps) => {
  const [legalCase, setLegalCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLegalCase = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) {
        console.error('Error fetching legal case:', error);
      } else {
        setLegalCase(data);
      }
      setLoading(false);
    };

    if (open && caseId) {
      fetchLegalCase();
    }
  }, [caseId, open]);

  const getStatusColor = (status: LegalCaseStatus) => {
    switch (status) {
      case 'pending_reminder':
        return 'bg-yellow-500';
      case 'in_legal_process':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      case 'escalated':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legal Case Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Case ID: {legalCase?.id}</h3>
            <p className="text-sm text-muted-foreground">Description: {legalCase?.description}</p>
            {legalCase?.status && (
              <Badge className={`text-white ${getStatusColor(legalCase.status as LegalCaseStatus)}`}>
                {legalCase.status}
              </Badge>
            )}
          </div>
          <div>
            <h4 className="font-medium">Amount Owed: ${legalCase?.amount_owed}</h4>
            <p>Priority: {legalCase?.priority}</p>
            <p>Assigned To: {legalCase?.assigned_to || 'Unassigned'}</p>
            <p>Created At: {legalCase?.created_at && new Date(legalCase.created_at).toLocaleString()}</p>
            <p>Updated At: {legalCase?.updated_at && new Date(legalCase.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};