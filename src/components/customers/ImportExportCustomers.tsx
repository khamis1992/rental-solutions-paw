import { Button } from "@/components/ui/button";
import { createTestUsers } from "@/utils/createTestUsers";
import { useToast } from "@/components/ui/use-toast";

export const ImportExportCustomers = () => {
  const { toast } = useToast();

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

  return (
    <div className="flex gap-2">
      <Button onClick={handleCreateTestUsers}>
        Create Test Users
      </Button>
    </div>
  );
};