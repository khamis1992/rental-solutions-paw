import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "./CategoryDialog";
import { formatCurrency } from "@/lib/utils";

export const CategoryList = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setShowDialog(true);
  };

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  const calculateTotalBudget = () => {
    if (!categories) return 0;
    return categories.reduce((total, category) => {
      const budget = Number(category.budget_limit) || 0;
      return total + budget;
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setShowDialog(true)}>Add Category</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Budget Limit</TableHead>
                  <TableHead>Budget Period</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.type}</TableCell>
                    <TableCell>
                      {category.budget_limit ? formatCurrency(Number(category.budget_limit)) : '-'}
                    </TableCell>
                    <TableCell>{category.budget_period || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-right">
            <p className="text-sm text-muted-foreground">
              Total Budget: {formatCurrency(calculateTotalBudget())}
            </p>
          </div>
        </CardContent>
      </Card>

      <CategoryDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        category={selectedCategory}
      />
    </div>
  );
};