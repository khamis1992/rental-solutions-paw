import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Car, UserPlus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4 transition-all hover:shadow-md">
        <Button
          variant="ghost"
          className="w-full h-auto flex flex-col items-center gap-2 py-6"
          onClick={() => navigate("/agreements/new")}
        >
          <FileText className="h-8 w-8 text-primary" />
          <span className="font-medium">New Agreement</span>
        </Button>
      </Card>

      <Card className="p-4 transition-all hover:shadow-md">
        <Button
          variant="ghost"
          className="w-full h-auto flex flex-col items-center gap-2 py-6"
          onClick={() => navigate("/vehicles/new")}
        >
          <Car className="h-8 w-8 text-primary" />
          <span className="font-medium">Add Vehicle</span>
        </Button>
      </Card>

      <Card className="p-4 transition-all hover:shadow-md">
        <Button
          variant="ghost"
          className="w-full h-auto flex flex-col items-center gap-2 py-6"
          onClick={() => navigate("/customers/new")}
        >
          <UserPlus className="h-8 w-8 text-primary" />
          <span className="font-medium">Add Customer</span>
        </Button>
      </Card>
    </div>
  );
};