import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FAQSection } from "@/components/help/FAQSection";
import { FeatureGuides } from "@/components/help/FeatureGuides";
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
      <div className="container max-w-7xl mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Help Center</h1>
            <p className="text-xl text-muted-foreground">
              Find comprehensive guides, documentation, and support for using the Rental Solutions system.
            </p>
          </div>
          <Button 
            onClick={handlePrint}
            className="print:hidden"
            variant="outline"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Documentation
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="w-full justify-start print:hidden">
            <TabsTrigger value="overview" className="text-lg px-6 py-3">Overview</TabsTrigger>
            <TabsTrigger value="features" className="text-lg px-6 py-3">Features</TabsTrigger>
            <TabsTrigger value="guides" className="text-lg px-6 py-3">Step-by-Step Guides</TabsTrigger>
            <TabsTrigger value="faq" className="text-lg px-6 py-3">FAQ</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-300px)] print:h-auto">
            <div className="print-content">
              <TabsContent value="overview">
                <Card className="border-2">
                  <CardContent className="pt-8 px-8">
                    <SystemOverview />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features">
                <Card className="border-2">
                  <CardContent className="pt-8 px-8">
                    <FeatureGuides />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guides">
                <Card className="border-2">
                  <CardContent className="pt-8 px-8">
                    <StepByStepGuides />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq">
                <Card className="border-2">
                  <CardContent className="pt-8 px-8">
                    <FAQSection />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;