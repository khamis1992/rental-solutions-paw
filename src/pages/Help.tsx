import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchBar } from "@/components/help/SearchBar";
import { FAQSection } from "@/components/help/FAQSection";
import { ContactSupport } from "@/components/help/ContactSupport";
import { FeatureGuides } from "@/components/help/FeatureGuides";
import { SystemOverview } from "@/components/help/SystemOverview";
import { StepByStepGuides } from "@/components/help/StepByStepGuides";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const Help = () => {
  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Find comprehensive guides, documentation, and support for using the Rental Solutions system.
          </p>
        </div>

        <SearchBar onSearch={(query) => console.log('Searching:', query)} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="guides">Step-by-Step Guides</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <TabsContent value="overview">
              <Card>
                <CardContent className="pt-6">
                  <SystemOverview />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardContent className="pt-6">
                  <FeatureGuides />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guides">
              <Card>
                <CardContent className="pt-6">
                  <StepByStepGuides />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardContent className="pt-6">
                  <FAQSection />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardContent className="pt-6">
                  <ContactSupport />
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