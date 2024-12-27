import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ImportExportCategories = () => {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const { data: categories, error } = await supabase
        .from("accounting_categories")
        .select(`
          name,
          type,
          description,
          budget_limit,
          budget_period,
          is_active
        `)
        .order('name');

      if (error) throw error;

      // Convert data to CSV
      const headers = ["Name", "Type", "Description", "Budget Limit", "Budget Period", "Active"];
      const csvData = categories.map((cat) => [
        cat.name,
        cat.type,
        cat.description || "",
        cat.budget_limit || "",
        cat.budget_period || "",
        cat.is_active ? "Yes" : "No"
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => 
          typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `categories_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Categories have been exported to CSV",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the categories",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
};