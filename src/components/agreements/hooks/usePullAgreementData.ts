import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePullAgreementData = (refetch: () => void) => {
  const [isPullingData, setIsPullingData] = useState(false);

  const validateDataMapping = async (remainingAmount: any, agreement: any) => {
    try {
      console.log('Validating data mapping:', { remainingAmount, agreement });
      
      const { data: aiValidation, error } = await supabase.functions.invoke('validate-agreement-mapping', {
        body: {
          remainingAmount,
          agreement,
          mapping: {
            agreement_duration: "Agreement Duration",
            final_price: "Contract Value/Total Amount",
            rent_amount: "Monthly Rent Amount",
            remaining_amount: "Remaining Balance"
          }
        }
      });

      if (error) {
        console.error('AI validation error:', error);
        toast.error(`Validation error: ${error.message}`);
        return false;
      }

      console.log('AI validation response:', aiValidation);

      if (!aiValidation.isValid) {
        toast.error(`AI detected mapping issue: ${aiValidation.message}`);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in AI validation:', err);
      toast.error('Failed to validate data mapping');
      return false;
    }
  };

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
              .select('*')
              .eq('agreement_number', amount.agreement_number)
              .maybeSingle();

            if (leaseError) {
              console.error('Error finding lease:', leaseError);
              errorCount++;
              continue;
            }

            if (leaseData) {
              // Validate data mapping with AI before updating
              const isValidMapping = await validateDataMapping(amount, leaseData);
              
              if (!isValidMapping) {
                errorCount++;
                continue;
              }

              // Update the lease with the values from remaining_amounts
              const updateResult = await supabase
                .from('leases')
                .update({
                  agreement_duration: amount.agreement_duration,
                  total_amount: amount.final_price,
                  rent_amount: amount.rent_amount
                })
                .eq('id', leaseData.id)
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
            }
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