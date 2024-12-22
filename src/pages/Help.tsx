import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchBar } from "@/components/help/SearchBar";
import { FAQSection } from "@/components/help/FAQSection";
import { ContactSupport } from "@/components/help/ContactSupport";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get support when you need it.
          </p>
        </div>

        <SearchBar onSearch={setSearchQuery} />

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;