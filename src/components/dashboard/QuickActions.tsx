import { toast } from "sonner";
import { FilePlus2, UserPlus2, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="border-2 hover:border-primary hover:shadow-md transition-all cursor-pointer" 
            onClick={() => navigate("/agreements/new")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500">
                <FilePlus2 className="h-6 w-6" />
              </div>
              <span className="font-medium text-lg">New Agreement</span>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:border-primary hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate("/vehicles/new")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-purple-50 text-purple-500">
                <Car className="h-6 w-6" />
              </div>
              <span className="font-medium text-lg">Add Vehicle</span>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:border-primary hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate("/customers/new")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-green-50 text-green-500">
                <UserPlus2 className="h-6 w-6" />
              </div>
              <span className="font-medium text-lg">Add Customer</span>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};