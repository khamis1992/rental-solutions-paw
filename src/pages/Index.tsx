import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Calendar, FileText, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const statsCards = [
  {
    title: "Total Customers",
    value: "2,345",
    icon: Users,
    change: "+12.5%",
    trend: "up",
  },
  {
    title: "Active Rentals",
    value: "145",
    icon: Calendar,
    change: "+5.2%",
    trend: "up",
  },
  {
    title: "Total Revenue",
    value: "$23,456",
    icon: DollarSign,
    change: "+8.4%",
    trend: "up",
  },
  {
    title: "Pending Reports",
    value: "12",
    icon: FileText,
    change: "-2.3%",
    trend: "down",
  },
];

const Index = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className={cn(
                  "text-xs text-muted-foreground",
                  card.trend === "up" ? "text-green-500" : "text-red-500"
                )}>
                  {card.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New Customer Registration</p>
                      <p className="text-xs text-muted-foreground">John Doe registered as a new customer</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Rental Started</p>
                      <p className="text-xs text-muted-foreground">Vehicle XYZ-123 rented by Sarah Smith</p>
                    </div>
                    <span className="text-xs text-muted-foreground">4h ago</span>
                  </div>
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Report Generated</p>
                      <p className="text-xs text-muted-foreground">Monthly revenue report for October 2023</p>
                    </div>
                    <span className="text-xs text-muted-foreground">6h ago</span>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button className="w-full rounded-lg border p-4 text-left hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Add New Customer</p>
                      <p className="text-sm text-muted-foreground">Register a new customer in the system</p>
                    </div>
                  </div>
                </button>
                <button className="w-full rounded-lg border p-4 text-left hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Start New Rental</p>
                      <p className="text-sm text-muted-foreground">Begin a new vehicle rental process</p>
                    </div>
                  </div>
                </button>
                <button className="w-full rounded-lg border p-4 text-left hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Generate Report</p>
                      <p className="text-sm text-muted-foreground">Create a new custom report</p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;