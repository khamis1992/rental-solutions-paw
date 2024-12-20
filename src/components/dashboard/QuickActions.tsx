import { toast } from "sonner";
import { createTestUsers } from "@/utils/createTestUsers";
import { createTestVehicles } from "@/utils/createTestVehicles";
import { createTestAgreements } from "@/utils/createTestAgreements";
import { FilePlus2, UserPlus2, Car, FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

  const handleCreateTestVehicles = async () => {
    try {
      await createTestVehicles();
      toast.success("Test vehicles created successfully");
    } catch (error) {
      console.error('Error creating test vehicles:', error);
      toast.error("Failed to create test vehicles");
    }
  };

  const handleCreateTestAgreements = async () => {
    try {
      await createTestAgreements();
      toast.success("Test agreements created successfully");
    } catch (error) {
      console.error('Error creating test agreements:', error);
      toast.error("Failed to create test agreements");
    }
  };

  const handleDeleteTestData = async () => {
    try {
      const { error } = await supabase.rpc('delete_all_agreements');
      if (error) throw error;
      toast.success("All test data deleted successfully");
    } catch (error) {
      console.error('Error deleting test data:', error);
      toast.error("Failed to delete test data");
    }
  };

  return (
    <div className="space-y-6">
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
          onClick={() => navigate("/vehicles/new")}
          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-500">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-medium">Add Vehicle</span>
        </button>

        <button
          onClick={() => navigate("/customers/new")}
          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50 text-green-500">
            <UserPlus2 className="h-5 w-5" />
          </div>
          <span className="font-medium">Add Customer</span>
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-medium mb-4">UAT Testing Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={handleCreateTestUsers}
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-orange-50 text-orange-500">
              <UserPlus2 className="h-5 w-5" />
            </div>
            <span className="font-medium">Create Test Users</span>
          </button>

          <button
            onClick={handleCreateTestVehicles}
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-cyan-50 text-cyan-500">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-medium">Create Test Vehicles</span>
          </button>

          <button
            onClick={handleCreateTestAgreements}
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-500">
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-medium">Create Test Agreements</span>
          </button>

          <button
            onClick={handleDeleteTestData}
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-red-50 text-red-500">
              <Trash2 className="h-5 w-5" />
            </div>
            <span className="font-medium">Clear Test Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};