import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createTestUsers } from "@/utils/createTestUsers";
import { FilePlus2, UserPlus2, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const handleCreateTestUsers = async () => {
    try {
      await createTestUsers();
      toast.success("Test users created successfully");
    } catch (error) {
      console.error('Error creating test users:', error);
      toast.error("Failed to create test users");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        onClick={() => navigate("/agreements/new")}
        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
      >
        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500">
          <FilePlus2 className="h-5 w-5" />
        </div>
        <span className="font-medium">New Agreement</span>
      </button>

      <button
        onClick={handleCreateTestUsers}
        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
      >
        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50 text-green-500">
          <UserPlus2 className="h-5 w-5" />
        </div>
        <span className="font-medium">Create Test Users</span>
      </button>

      <button
        onClick={() => navigate("/vehicles/new")}
        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
      >
        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-500">
          <Car className="h-5 w-5" />
        </div>
        <span className="font-medium">Add Vehicle</span>
      </button>
    </div>
  );
};