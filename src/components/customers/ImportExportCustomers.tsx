import { Button } from "@/components/ui/button";
import { createTestUsers } from "@/utils/createTestUsers";
import { useToast } from "@/hooks/use-toast";
import { useCustomerImport } from "./hooks/useCustomerImport";
import { Upload } from "lucide-react";

export const ImportExportCustomers = () => {
  const { toast } = useToast();
  const { isUploading, handleFileUpload } = useCustomerImport();

  const handleCreateTestUsers = async () => {
    try {
      const result = await createTestUsers();
      toast({
        title: "Success",
        description: "Test users have been created successfully",
      });
      // Refresh the customer list if needed
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test users",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleCreateTestUsers}>
        Create Test Users
      </Button>
      <Button disabled={isUploading} asChild>
        <label className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Importing..." : "Import CSV"}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </Button>
    </div>
  );
};