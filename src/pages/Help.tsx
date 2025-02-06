import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FAQSection } from "@/components/help/FAQSection";
import { SystemOverview } from "@/components/help/SystemOverview";
import { StepByStepGuides } from "@/components/help/StepByStepGuides";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { injectPrintStyles } from "@/lib/printStyles";
import { useEffect } from "react";

const Help = () => {
  useEffect(() => {
    injectPrintStyles();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-56px)] w-full">
        {/* Header Section - Reduced top padding */}
        <div className="flex-shrink-0 w-full bg-background border-b">
          <div className="container mx-auto flex justify-between items-center py-3">
            <div>
              <h1 className="text-2xl font-bold">مركز المساعدة</h1>
              <p className="text-base text-muted-foreground">
                اعثر على أدلة شاملة ووثائق ودعم لاستخدام نظام إدارة التأجير
              </p>
            </div>
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
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger 
                  value="guides" 
                  className="relative px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  الدليل خطوة بخطوة
                </TabsTrigger>
                <TabsTrigger 
                  value="faq" 
                  className="relative px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  الأسئلة الشائعة
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