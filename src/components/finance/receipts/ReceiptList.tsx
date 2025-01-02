import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export const ReceiptList = () => {
  const { data: receipts } = useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounting_transactions')
        .select('*')
        .not('receipt_url', 'is', null);
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      {receipts?.map((receipt) => (
        <div key={receipt.id} className="flex items-center justify-between p-4 border rounded">
          <div>
            <p className="font-medium">{receipt.description}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(Number(receipt.amount))}</p>
          </div>
          {receipt.receipt_url && (
            <a href={receipt.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              View Receipt
            </a>
          )}
        </div>
      ))}
    </div>
  );
};