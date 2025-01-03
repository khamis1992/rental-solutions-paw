import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export const CategoryList = () => {
  const [showDialog, setShowDialog] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_categories")
        .select(`
          *,
          transactions:accounting_transactions(
            amount
          )
        `)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Budget Limit</TableHead>
                <TableHead>Budget Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => {
                const totalAmount = category.transactions?.reduce(
                  (sum: number, transaction: { amount: string | number }) => 
                    sum + Number(transaction.amount), 
                  0
                ) || 0;

                return (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.type}</TableCell>
                    <TableCell>{formatCurrency(totalAmount)}</TableCell>
                    <TableCell>
                      {category.budget_limit
                        ? formatCurrency(category.budget_limit)
                        : "N/A"}
                    </TableCell>
                    <TableCell>{category.budget_period || "N/A"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CategoryDialog
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </div>
  );
};