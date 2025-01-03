import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RawPaymentImport } from "@/components/finance/types/transaction.types";
import { Loader2, Trash2 } from "lucide-react";

export const RawDataView = () => {
  const queryClient = useQueryClient();

  const { data: rawPayments, isLoading } = useQuery({
    queryKey: ['raw-payment-imports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_payment_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching raw payments:', error);
        toast.error('Failed to fetch raw payments');
        throw error;
      }

      // Filter out payments that are already assigned
      return (data as RawPaymentImport[]).filter(payment => !payment.is_valid);
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (rawPaymentId: string) => {
      console.log('Analyzing payment:', rawPaymentId);
      const { data, error } = await supabase.functions.invoke('analyze-payment-import', {
        body: { rawPaymentId }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
      toast.success('Payment analyzed successfully');
    },
    onError: (error: Error) => {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze payment');
    }
  });

  const analyzeAllMutation = useMutation({
    mutationFn: async () => {
      if (!rawPayments) return;
      
      const results = [];
      for (const payment of rawPayments) {
        if (!payment.is_valid && payment.id) {
          try {
            const result = await analyzeMutation.mutateAsync(payment.id);
            results.push(result);
          } catch (error) {
            console.error(`Failed to analyze payment ${payment.id}:`, error);
            results.push({ error });
          }
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successCount = results?.filter(r => !r.error).length || 0;
      const errorCount = results?.filter(r => r.error).length || 0;
      
      if (errorCount > 0) {
        toast.error(`Failed to analyze ${errorCount} payments`);
      }
      if (successCount > 0) {
        toast.success(`Successfully analyzed ${successCount} payments`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
    },
    onError: (error: Error) => {
      console.error('Batch analysis error:', error);
      toast.error('Failed to analyze all payments');
    }
  });

  const cleanTableMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('raw_payment_imports')
        .delete()
        .eq('is_valid', true);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
      toast.success('Successfully cleaned assigned payments from the table');
    },
    onError: (error: Error) => {
      console.error('Clean table error:', error);
      toast.error('Failed to clean the table');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Raw Payment Import Data</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => cleanTableMutation.mutate()}
            disabled={cleanTableMutation.isPending}
          >
            {cleanTableMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clean Table
              </>
            )}
          </Button>
          <Button 
            onClick={() => analyzeAllMutation.mutate()}
            disabled={analyzeAllMutation.isPending}
          >
            {analyzeAllMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze All'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rawPayments?.map((payment) => (
            <Card key={payment.Transaction_ID}>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Agreement Number:</strong> {payment.Agreement_Number}</p>
                    <p><strong>Customer Name:</strong> {payment.Customer_Name}</p>
                    <p><strong>Amount:</strong> {payment.Amount}</p>
                    <p><strong>Payment Method:</strong> {payment.Payment_Method}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant={payment.is_valid ? "outline" : "default"}
                      onClick={() => payment.id && analyzeMutation.mutate(payment.id)}
                      disabled={payment.is_valid || analyzeMutation.isPending}
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : payment.is_valid ? (
                        'Validated'
                      ) : (
                        'Analyze'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};