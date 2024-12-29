import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GuideStep {
  step: string;
}

interface Guide {
  id: string;
  title: string;
  category_id: string;
  steps: GuideStep[] | string[];
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

  const { data: guides } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_guides')
        .select('*');
      
      if (error) throw error;
      return data as Guide[];
    }
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-semibold">Step-by-Step Guides</h2>
        <p className="text-muted-foreground">
          Comprehensive guides for operational, technical, and administrative procedures
        </p>
      </div>

      <Tabs defaultValue={categories?.[0]?.slug} className="w-full space-y-6">
        <div className="sticky top-0 z-10 bg-background pb-2 w-full">
          <ScrollArea className="w-full" orientation="horizontal">
            <TabsList className="w-full justify-start inline-flex">
              {categories?.map((category) => (
                <TabsTrigger 
                  key={category.id}
                  value={category.slug} 
                  className="min-w-[120px]"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {categories?.map((category) => (
          <TabsContent 
            key={category.id}
            value={category.slug} 
            className="space-y-6 focus-visible:outline-none focus-visible:ring-0 w-full"
          >
            <div className="space-y-4">
              {guides?.filter(guide => guide.category_id === category.id)
                .map((guide) => (
                  <Card key={guide.id} className="p-6">
                    <h3 className="text-lg font-medium mb-4">{guide.title}</h3>
                    <ol className="space-y-3">
                      {Array.isArray(guide.steps) && guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm">{typeof step === 'string' ? step : step.step}</span>
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