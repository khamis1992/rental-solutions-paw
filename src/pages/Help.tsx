import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FAQSection } from "@/components/help/FAQSection";
import { FeatureGuides } from "@/components/help/FeatureGuides";
import { SystemOverview } from "@/components/help/SystemOverview";
import { StepByStepGuides } from "@/components/help/StepByStepGuides";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const Help = () => {
  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto py-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Help Center</h1>
          <p className="text-xl text-muted-foreground">
            Find comprehensive guides, documentation, and support for using the Rental Solutions system.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview" className="text-lg px-6 py-3">Overview</TabsTrigger>
            <TabsTrigger value="features" className="text-lg px-6 py-3">Features</TabsTrigger>
            <TabsTrigger value="guides" className="text-lg px-6 py-3">Step-by-Step Guides</TabsTrigger>
            <TabsTrigger value="faq" className="text-lg px-6 py-3">FAQ</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-300px)]">
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
          </ScrollArea>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;