import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Transaction = {
  type: 'expense' | 'revenue';
  amount: number;
  description: string;
  date: Date;
};

type RecentTransactionsListProps = {
  transactions: Transaction[];
};

export const RecentTransactionsList = ({ transactions }: RecentTransactionsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date.toLocaleDateString()}
                  </p>
                </div>
                <div className={`font-medium ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No transactions found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};