import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/finance/types/transaction.types";

export const PayrollManagement = () => {
  const { data: transactions } = useQuery({
    queryKey: ["payroll-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .eq("type", "EXPENSE")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(transaction => ({
        ...transaction,
        amount: Number(transaction.amount)
      })) as Transaction[];
    }
  });

  return (
    <div>
      <h2 className="text-2xl font-bold">Payroll Management</h2>
      <table className="min-w-full mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.map(transaction => (
            <tr key={transaction.id}>
              <td className="border px-4 py-2">{new Date(transaction.created_at).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{transaction.description}</td>
              <td className="border px-4 py-2">{transaction.amount}</td>
              <td className="border px-4 py-2">{transaction.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
