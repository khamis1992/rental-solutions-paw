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
      <div className="flex flex-col h-[calc(100vh-56px)] w-full">
        <div className="flex-shrink-0 w-full px-4 py-4 bg-background border-b">
          <div className="container mx-auto flex justify-between items-center">
            <div className="space-y-1 max-w-3xl">
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

        <div className="flex-grow overflow-hidden">
          <div className="container h-full mx-auto py-4">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="w-full justify-start border-b print:hidden mb-4">
                <TabsTrigger value="overview" className="text-base px-6 py-2">Overview</TabsTrigger>
                <TabsTrigger value="guides" className="text-base px-6 py-2">Step-by-Step Guides</TabsTrigger>
                <TabsTrigger value="faq" className="text-base px-6 py-2">FAQ</TabsTrigger>
              </TabsList>

              <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-[calc(100vh-280px)] w-full print:h-auto">
                  <div className="print-content space-y-4 pb-6">
                    <TabsContent value="overview" className="mt-0">
                      <Card className="border">
                        <CardContent className="pt-4">
                          <SystemOverview />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="guides" className="mt-0">
                      <Card className="border">
                        <CardContent className="pt-4">
                          <StepByStepGuides />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="faq" className="mt-0">
                      <Card className="border">
                        <CardContent className="pt-4">
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