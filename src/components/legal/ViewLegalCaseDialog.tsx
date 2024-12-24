import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LegalCaseStatus } from "@/types/legal";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ViewLegalCaseDialogProps {
  caseId: string;
}

export const ViewLegalCaseDialog = ({ caseId }: ViewLegalCaseDialogProps) => {
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

    fetchLegalCase();
  }, [caseId]);

  const getStatusColor = (status: LegalCaseStatus) => {
    switch (status) {
      case 'pending_reminder':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legal Case Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Case ID: {legalCase.id}</h3>
            <p className="text-sm text-muted-foreground">Description: {legalCase.description}</p>
            <Badge className={`text-white ${getStatusColor(legalCase.status)}`}>
              {legalCase.status}
            </Badge>
          </div>
          <div>
            <h4 className="font-medium">Amount Owed: ${legalCase.amount_owed}</h4>
            <p>Priority: {legalCase.priority}</p>
            <p>Assigned To: {legalCase.assigned_to || 'Unassigned'}</p>
            <p>Created At: {new Date(legalCase.created_at).toLocaleString()}</p>
            <p>Updated At: {new Date(legalCase.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
