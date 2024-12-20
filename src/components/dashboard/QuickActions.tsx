import { Button } from "@/components/ui/button";
import { createTestUsers } from "@/utils/createTestUsers";
import { toast } from "sonner";
import { 
  UserPlus, 
  Car, 
  FileText, 
  Wrench,
  Users
} from "lucide-react";

export const QuickActions = () => {
  const handleCreateTestUsers = async () => {
    try {
      const result = await createTestUsers();
      toast.success("Test users created successfully");
      console.log('Test users creation result:', result);
    } catch (error) {
      console.error('Error creating test users:', error);
      toast.error("Failed to create test users");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="w-full justify-start">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Car className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          New Agreement
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Wrench className="mr-2 h-4 w-4" />
          Schedule Service
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleCreateTestUsers}
        >
          <Users className="mr-2 h-4 w-4" />
          Create Test Users
        </Button>
      </div>
    </div>
  );
};