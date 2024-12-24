import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateToDisplay } from "../utils/dateUtils";
import { Database } from "@/integrations/supabase/types";

// Get the lease_status type from the Database types
type LeaseStatus = Database['public']['Enums']['lease_status'];

interface AgreementHeaderInfoProps {
  agreement: {
    id: string;
    agreement_number: string | null;
    status: LeaseStatus;
    start_date: string;
    end_date: string;
    vehicle_id: string;
  };
  onUpdate: () => void;
}

export const AgreementHeaderInfo = ({ agreement, onUpdate }: AgreementHeaderInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [agreementNumber, setAgreementNumber] = useState(agreement.agreement_number || '');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<LeaseStatus>(agreement.status);

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

  const validateStatusChange = async (newStatus: LeaseStatus) => {
    // Check if vehicle is available when activating agreement
    if (newStatus === 'active') {
      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .select('status')
        .eq('id', agreement.vehicle_id)
        .single();

      if (error) {
        throw new Error('Failed to check vehicle status');
      }

      if (vehicle.status !== 'available' && vehicle.status !== 'reserve') {
        throw new Error('Vehicle is not available for rental');
      }
    }

    // Check for pending payments when closing agreement
    if (newStatus === 'closed') {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('status')
        .eq('lease_id', agreement.id)
        .eq('status', 'pending');

      if (error) {
        throw new Error('Failed to check pending payments');
      }

      if (payments.length > 0) {
        throw new Error('Cannot close agreement with pending payments');
      }
    }

    return true;
  };

  const handleStatusChange = async (status: LeaseStatus) => {
    try {
      await validateStatusChange(status);

      const updateData: {
        status: LeaseStatus;
        end_date?: string;
      } = {
        status,
      };

      // Set end date when closing or terminating
      if (status === 'closed') {
        updateData.end_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leases')
        .update(updateData)
        .eq('id', agreement.id);

      if (error) throw error;

      toast.success('Agreement status updated successfully');
      setIsChangingStatus(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating agreement status:', error);
      toast.error(error.message || 'Failed to update agreement status');
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
            <div className="flex items-center gap-2">
              {isChangingStatus ? (
                <>
                  <Select
                    value={newStatus}
                    onValueChange={(value: LeaseStatus) => setNewStatus(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_payment">Pending Payment</SelectItem>
                      <SelectItem value="pending_deposit">Pending Deposit</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleStatusChange(newStatus)} size="sm">Save</Button>
                  <Button onClick={() => setIsChangingStatus(false)} variant="outline" size="sm">Cancel</Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium capitalize">{agreement.status}</p>
                  <Button onClick={() => setIsChangingStatus(true)} variant="outline" size="sm">Change Status</Button>
                </>
              )}
            </div>
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