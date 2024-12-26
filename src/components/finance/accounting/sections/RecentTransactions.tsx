import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const RecentTransactions = () => {
  const { data: transactions } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          *,
          accounting_categories (
            name
          )
        `)
        .order("transaction_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions?.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                    <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                      {transaction.type}
                    </Badge>
                    {transaction.accounting_categories?.name && (
                      <Badge variant="secondary">
                        {transaction.accounting_categories.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};