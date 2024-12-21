import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Car, UserPlus2 } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "New Agreement",
      icon: FileText,
      path: "/agreements",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Add Vehicle",
      icon: Car,
      path: "/vehicles",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Add Customer",
      icon: UserPlus2,
      path: "/customers",
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.title}
            className="border hover:border-primary hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(action.path)}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${action.bgColor} ${action.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-medium text-lg">{action.title}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};