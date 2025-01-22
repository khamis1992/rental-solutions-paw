import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Customers = () => {
  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8">
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <CardTitle className="text-3xl font-bold">Customer Management</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Manage customer profiles, track relationships, and monitor customer activity
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CreateCustomerDialog>
                      <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
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
          </CardHeader>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <CustomerStats />
      </div>
      
      {/* Customer List Section */}
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