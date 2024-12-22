import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuidesSection } from "./guides/GuidesSection";
import { guides } from "./guides/guidesData";

export const StepByStepGuides = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-left">Step-by-Step Guides</h2>
      <Tabs defaultValue="dashboard" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start inline-flex">
            <TabsTrigger value="dashboard" className="min-w-[120px]">Dashboard</TabsTrigger>
            <TabsTrigger value="customers" className="min-w-[120px]">Customers</TabsTrigger>
            <TabsTrigger value="agreements" className="min-w-[120px]">Agreements</TabsTrigger>
            <TabsTrigger value="finance" className="min-w-[120px]">Finance</TabsTrigger>
            <TabsTrigger value="vehicles" className="min-w-[120px]">Vehicles</TabsTrigger>
            <TabsTrigger value="legal" className="min-w-[120px]">Legal</TabsTrigger>
            <TabsTrigger value="reports" className="min-w-[120px]">Reports</TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(guides).map(([category, categoryGuides]) => (
          <TabsContent 
            key={category} 
            value={category} 
            className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <GuidesSection guides={categoryGuides} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};