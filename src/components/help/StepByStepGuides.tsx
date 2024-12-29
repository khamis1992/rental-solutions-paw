import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { guides } from "./guides/data";

interface GuideStep {
  step: string;
}

interface Guide {
  title: string;
  steps: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const StepByStepGuides = () => {
  const { data: categories } = useQuery({
    queryKey: ['guide-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_guide_categories')
        .select('*');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Get all guides from different modules
  const {
    operational,
    technical,
    administrative,
    module: moduleGuides,
    financial,
    legal
  } = guides;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-semibold">Step-by-Step Guides</h2>
        <p className="text-muted-foreground">
          Comprehensive guides for system features and operations
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start inline-flex">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {Object.entries(moduleGuides).map(([section, guides]) => (
          <TabsContent 
            key={section}
            value={section} 
            className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="space-y-4">
              {guides.map((guide, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-medium mb-4">{guide.title}</h3>
                  <ol className="space-y-3">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};