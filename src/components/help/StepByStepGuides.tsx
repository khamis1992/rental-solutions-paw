import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      <h2 className="text-2xl font-semibold text-left">Step-by-Step Guides</h2>
      <Tabs defaultValue={categories?.[0]?.slug} className="w-full space-y-6">
        <div className="overflow-x-auto pb-2 w-full">
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
                    <ol className="space-y-2">
                      {Array.isArray(guide.steps) && guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-3">
                          <span className="text-primary font-medium">{stepIndex + 1}.</span>
                          <span>{typeof step === 'string' ? step : step.step}</span>
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