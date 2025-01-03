import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "./CategoryDialog";

export const CategoryList = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounting_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const calculateBudgetUsage = (category: any) => {
    if (!category.budget_limit) return 0;
    return Math.round((Number(category.used_amount || 0) / Number(category.budget_limit)) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Button onClick={() => setDialogOpen(true)}>Add Category</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.type}</TableCell>
                <TableCell>
                  {category.budget_limit ? `QAR ${category.budget_limit}` : 'N/A'}
                </TableCell>
                <TableCell>{calculateBudgetUsage(category)}%</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};