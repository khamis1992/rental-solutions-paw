import { Card } from "@/components/ui/card";
import { User, Car, FileText } from "lucide-react";

export const SystemOverview = () => {
  const features = [
    {
      icon: User,
      title: "Customer Management",
      description: "Manage customer profiles, documents, and rental history efficiently."
    },
    {
      icon: Car,
      title: "Vehicle Management",
      description: "Track vehicle status, maintenance, and availability in real-time."
    },
    {
      icon: FileText,
      title: "Agreements",
      description: "Create and manage rental agreements with automated workflows."
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-left">Welcome to Rental Solutions</h1>
        <p className="text-base text-muted-foreground text-left leading-relaxed">
          Rental Solutions is a comprehensive vehicle rental management system designed to streamline your rental operations.
          This help center will guide you through all features and functionalities of the system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 w-full">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow h-full">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center gap-3">
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                {feature.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};