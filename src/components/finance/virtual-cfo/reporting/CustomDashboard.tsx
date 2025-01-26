import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataComponent } from "@/types/finance.types";

interface CustomDashboardProps {
  components?: DataComponent[];
}

export const CustomDashboard = ({ components = [] }: CustomDashboardProps) => {
  const renderComponent = (component: DataComponent) => {
    switch (component.type) {
      case 'chart':
        return <div>Chart Component</div>;
      case 'table':
        return <div>Table Component</div>;
      case 'metric':
        return <div>Metric Component</div>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {components.map((component, index) => (
            <div key={index}>
              {renderComponent(component)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};