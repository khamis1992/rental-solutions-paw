import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { ImportExportCustomers } from "@/components/customers/ImportExportCustomers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Customers = () => {
  return (
    <DashboardLayout>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                Customer Management
              </CardTitle>
              <CardDescription className="mt-2">
                Manage customer profiles, track relationships, and monitor customer activity
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ImportExportCustomers />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Import customer data from CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CreateCustomerDialog>
                      <Button className="flex items-center gap-2">
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

      <CustomerStats />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Customer List</CardTitle>
          <CardDescription>
            View and manage all customer profiles and their associated information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerList />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Customers;