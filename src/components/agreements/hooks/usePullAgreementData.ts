import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePullAgreementData = (refetch: () => void) => {
  const [isPullingData, setIsPullingData] = useState(false);

  const handlePullData = async () => {
    try {
      setIsPullingData(true);
      
      // Fetch remaining amounts data
      const { data: remainingAmounts, error: remainingAmountsError } = await supabase
        .from('remaining_amounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (remainingAmountsError) {
        console.error('Error fetching remaining amounts:', remainingAmountsError);
        toast.error('Failed to fetch remaining amounts data');
        return;
      }

      if (!remainingAmounts || remainingAmounts.length === 0) {
        toast.info('No remaining amounts data found');
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const processedAgreements = new Set();

      // Process each remaining amount sequentially
      for (const amount of remainingAmounts) {
        // Skip if we've already processed this agreement
        if (processedAgreements.has(amount.agreement_number)) {
          continue;
        }

        try {
          let leaseId = amount.lease_id;

          if (!leaseId && amount.agreement_number) {
            // Try to find the lease by agreement number
            const { data: leaseData, error: leaseError } = await supabase
              .from('leases')
              .select('id')
              .eq('agreement_number', amount.agreement_number)
              .maybeSingle();

            if (leaseError) {
              console.error('Error finding lease:', leaseError);
              errorCount++;
              continue;
            }

            if (leaseData) {
              leaseId = leaseData.id;
            }
          }

          if (leaseId) {
            // Update the lease with the pulled data
            const updateResult = await supabase
              .from('leases')
              .update({
                agreement_duration: amount.agreement_duration,
                total_amount: amount.final_price,
                rent_amount: amount.rent_amount
              })
              .eq('id', leaseId)
              .select();

            if (updateResult.error) {
              console.error('Error updating agreement:', updateResult.error);
              errorCount++;
            } else {
              successCount++;
              processedAgreements.add(amount.agreement_number);
              console.log(`Successfully updated agreement ${amount.agreement_number}:`, {
                agreement_duration: amount.agreement_duration,
                total_amount: amount.final_price,
                rent_amount: amount.rent_amount,
                remaining_amount: amount.remaining_amount
              });
            }
          } else {
            console.error('No lease ID found for agreement:', amount.agreement_number);
            errorCount++;
          }
        } catch (error) {
          console.error('Error processing agreement:', amount.agreement_number, error);
          errorCount++;
        }
      }

      await refetch();
      
      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} agreements`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} agreements`);
      }
      if (successCount === 0 && errorCount === 0) {
        toast.info('No agreements to update');
      }

    } catch (error) {
      console.error('Error pulling data:', error);
      toast.error('Failed to pull data');
    } finally {
      setIsPullingData(false);
    }
  };

  return {
    isPullingData,
    handlePullData
  };
};