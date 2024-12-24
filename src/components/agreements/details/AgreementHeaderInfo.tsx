import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateToDisplay } from "../utils/dateUtils";

interface AgreementHeaderInfoProps {
  agreement: {
    id: string;
    agreement_number: string | null;
    status: string;
    start_date: string;
    end_date: string;
  };
  onUpdate: () => void;
}

export const AgreementHeaderInfo = ({ agreement, onUpdate }: AgreementHeaderInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [agreementNumber, setAgreementNumber] = useState(agreement.agreement_number || '');

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('leases')
        .update({ agreement_number: agreementNumber })
        .eq('id', agreement.id);

      if (error) throw error;

      toast.success('Agreement number updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating agreement number:', error);
      toast.error('Failed to update agreement number');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Agreement Number</Label>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Input
                    value={agreementNumber}
                    onChange={(e) => setAgreementNumber(e.target.value)}
                    className="text-lg font-medium"
                  />
                  <Button onClick={handleSave} size="sm">Save</Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">Cancel</Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">{agreement.agreement_number}</p>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">Edit</Button>
                </>
              )}
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <p className="text-lg font-medium capitalize">{agreement.status}</p>
          </div>
          <div>
            <Label>Start Date</Label>
            <p>{formatDateToDisplay(agreement.start_date)}</p>
          </div>
          <div>
            <Label>End Date</Label>
            <p>{formatDateToDisplay(agreement.end_date)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};