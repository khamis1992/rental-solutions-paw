import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FAQSection } from "@/components/help/FAQSection";
import { SystemOverview } from "@/components/help/SystemOverview";
import { StepByStepGuides } from "@/components/help/StepByStepGuides";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { injectPrintStyles } from "@/lib/printStyles";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const Help = () => {
  const { toast } = useToast();

  useEffect(() => {
    injectPrintStyles();
  }, []);

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print dialog opened",
      description: "The print dialog has been opened. Select your printer to continue.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-56px)] w-full">
        {/* Header Section - Reduced top padding */}
        <div className="flex-shrink-0 w-full bg-background border-b">
          <div className="container mx-auto flex justify-between items-center py-3">
            <div>
              <h1 className="text-2xl font-bold">Help Center</h1>
              <p className="text-base text-muted-foreground">
                Find comprehensive guides, documentation, and support for using the Rental Solutions system.
              </p>
            </div>
            <Button 
              onClick={handlePrint}
              className="print:hidden"
              variant="outline"
              size="sm"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Documentation
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow overflow-hidden">
          <div className="container mx-auto py-4">
            <Tabs defaultValue="overview" className="h-full space-y-4">
              <TabsList className="w-full justify-start border-b bg-transparent p-0">
                <TabsTrigger 
                  value="overview" 
                  className="relative px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="guides" 
                  className="relative px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Step-by-Step Guides
                </TabsTrigger>
                <TabsTrigger 
                  value="faq" 
                  className="relative px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  FAQ
                </TabsTrigger>
              </TabsList>

              <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-[calc(100vh-240px)] w-full print:h-auto px-1">
                  <div className="space-y-4 pb-8">
                    <TabsContent value="overview" className="mt-0 space-y-4">
                      <Card className="border shadow-sm">
                        <CardContent className="p-6">
                          <SystemOverview />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="guides" className="mt-0 space-y-4">
                      <Card className="border shadow-sm">
                        <CardContent className="p-6">
                          <StepByStepGuides />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="faq" className="mt-0 space-y-4">
                      <Card className="border shadow-sm">
                        <CardContent className="p-6">
                          <FAQSection />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Help;