import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, HelpCircle, Info } from "lucide-react";

const Help = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground mt-1">
            Find answers to common questions and learn how to use the system effectively.
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-4">
          <TabsList>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicle Management</TabsTrigger>
            <TabsTrigger value="customers">Customer Management</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Welcome to AutoRent Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt="Dashboard overview"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Getting Started Guide</h3>
                  <p>
                    AutoRent Pro helps you manage your vehicle rental business efficiently. Here's how to get started:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>View your fleet status and performance on the Dashboard</li>
                    <li>Manage vehicles and maintenance schedules</li>
                    <li>Track customer information and rental history</li>
                    <li>Create and monitor rental agreements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Use the sidebar for quick navigation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Check notifications for important updates
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Monitor vehicle status in real-time
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    If you need assistance, you can:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Contact support at support@autorentpro.com
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Check our documentation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Schedule a training session
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Vehicle Management Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt="Vehicle management interface"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Managing Your Fleet</h3>
                  <p>Learn how to effectively manage your vehicle fleet:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Add and update vehicle information</li>
                    <li>Track maintenance schedules</li>
                    <li>Monitor vehicle availability</li>
                    <li>Generate vehicle reports</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Customer Management Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt="Customer management interface"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Managing Customers</h3>
                  <p>Learn how to manage customer information and relationships:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Add and update customer profiles</li>
                    <li>View rental history</li>
                    <li>Track customer preferences</li>
                    <li>Manage communication</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agreements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Rental Agreements Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt="Rental agreements interface"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Managing Agreements</h3>
                  <p>Learn how to handle rental agreements effectively:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create new rental agreements</li>
                    <li>Process payments and deposits</li>
                    <li>Track agreement status</li>
                    <li>Handle extensions and returns</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;