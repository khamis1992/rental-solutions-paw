import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Banknote, 
  BarChart3, 
  Users, 
  FileText, 
  Car, 
  Scale, 
  HelpCircle,
  AlertTriangle
} from "lucide-react";

interface FeatureGuideProps {
  icon: React.ElementType;
  title: string;
  description: string;
  keyFeatures: string[];
}

const FeatureGuide = ({ icon: Icon, title, description, keyFeatures }: FeatureGuideProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Key Features:</h4>
          <ul className="text-sm space-y-1">
            {keyFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export const FeatureGuides = () => {
  const guides: FeatureGuideProps[] = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      description: "Get a comprehensive overview of your rental operations with real-time metrics and insights.",
      keyFeatures: [
        "Real-time business metrics",
        "Activity monitoring",
        "Quick access to common tasks",
        "Customizable widgets"
      ]
    },
    {
      icon: Banknote,
      title: "Finance Management",
      description: "Manage all financial aspects of your rental business efficiently.",
      keyFeatures: [
        "Payment processing",
        "Invoice generation",
        "Financial reporting",
        "Revenue tracking"
      ]
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Generate detailed reports and gain valuable insights into your business performance.",
      keyFeatures: [
        "Custom report generation",
        "Performance analytics",
        "Data visualization",
        "Export capabilities"
      ]
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Efficiently manage customer relationships and maintain detailed profiles.",
      keyFeatures: [
        "Customer profiles",
        "Document management",
        "Communication history",
        "Credit assessment"
      ]
    },
    {
      icon: FileText,
      title: "Agreements",
      description: "Create and manage rental agreements with automated workflows.",
      keyFeatures: [
        "Agreement generation",
        "Template management",
        "Digital signatures",
        "Payment scheduling"
      ]
    },
    {
      icon: Car,
      title: "Vehicle Management",
      description: "Track and manage your vehicle fleet effectively.",
      keyFeatures: [
        "Vehicle tracking",
        "Maintenance scheduling",
        "Availability management",
        "Document storage"
      ]
    },
    {
      icon: Scale,
      title: "Legal Management",
      description: "Handle legal aspects of your rental business with confidence.",
      keyFeatures: [
        "Contract management",
        "Legal document generation",
        "Compliance tracking",
        "Case management"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Traffic Fines",
      description: "Efficiently manage and process traffic violations and fines.",
      keyFeatures: [
        "Fine tracking",
        "Automatic assignment",
        "Payment processing",
        "Violation history"
      ]
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Access comprehensive help resources and support documentation.",
      keyFeatures: [
        "Step-by-step guides",
        "Video tutorials",
        "FAQs",
        "Support contact"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Feature Documentation</h2>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid gap-6">
          {guides.map((guide, index) => (
            <FeatureGuide key={index} {...guide} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};