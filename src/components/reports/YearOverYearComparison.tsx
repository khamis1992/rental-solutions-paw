import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const YearOverYearComparison = () => {
  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounting_transactions')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const currentYearTotal = transactions?.reduce((acc, curr) => {
    const transactionYear = new Date(curr.transaction_date).getFullYear();
    return transactionYear === currentYear ? acc + Number(curr.amount) : acc;
  }, 0) || 0;

  const lastYearTotal = transactions?.reduce((acc, curr) => {
    const transactionYear = new Date(curr.transaction_date).getFullYear();
    return transactionYear === lastYear ? acc + Number(curr.amount) : acc;
  }, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Year over Year Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Current Year ({currentYear}): {currentYearTotal}</p>
          <p>Last Year ({lastYear}): {lastYearTotal}</p>
        </div>
      </CardContent>
    </Card>
  );
};