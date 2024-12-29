import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionTable } from "./TransactionTable";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("payment_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: functionError } = await supabase.functions
        .invoke('process-transaction-import', {
          body: { fileName }
        });

      if (functionError) throw functionError;

      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || "Failed to import file");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing transactions...
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <TransactionTable
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={(field) => {
          if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
          } else {
            setSortField(field);
            setSortDirection("desc");
          }
        }}
      />
    </div>
  );
};