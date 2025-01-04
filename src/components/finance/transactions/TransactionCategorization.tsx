import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "../categories/CategoryDialog";

export const TransactionCategorization = () => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction Categorization</h2>
        <Button onClick={() => setShowCategoryDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </div>
  );
};