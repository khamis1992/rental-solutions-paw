import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export const FinancialGoals = () => {
  const { data: goals } = useQuery({
    queryKey: ["financial-goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {goals?.map((goal) => {
        const progress = (goal.current_amount / goal.target_amount) * 100;
        const remaining = goal.target_amount - goal.current_amount;

        return (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{goal.name}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.priority === "high" 
                    ? "bg-red-100 text-red-800"
                    : goal.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}>
                  {goal.priority} priority
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(goal.current_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(goal.target_amount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">{format(new Date(goal.start_date), 'PP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Date</p>
                    <p className="text-sm font-medium">{format(new Date(goal.target_date), 'PP')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Remaining Amount</p>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(remaining)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {!goals?.length && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No financial goals set
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};