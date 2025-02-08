
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, UserPlus, FileUp, FileDown, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Customers = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{getTimeBasedGreeting()}</p>
                    <CardTitle className="text-3xl font-bold">Customer Management</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Manage customer profiles, track relationships, and monitor customer activity
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-white/50 hover:bg-white/80">
                        <FileUp className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Import Customers</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-white/50 hover:bg-white/80">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export Customers</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-white/50 hover:bg-white/80">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Customer Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CreateCustomerDialog>
                        <Button className={cn(
                          "bg-primary hover:bg-primary/90 text-white",
                          "flex items-center gap-2 ml-2"
                        )}>
                          <UserPlus className="h-4 w-4" />
                          Add Customer
                        </Button>
                      </CreateCustomerDialog>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a new customer to the system</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-8">
        <CustomerStats />
      </div>
      
      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Customer List</CardTitle>
          <CardDescription>
            View and manage all customer profiles and their associated information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CustomerList />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Customers;

