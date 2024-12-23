import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuidesSection } from "./guides/GuidesSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Guide {
  id: string;
  title: string;
  steps: string[];
}

interface GuidesByCategory {
  [key: string]: Guide[];
}

export const StepByStepGuides = () => {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['guide-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_guide_categories')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: guides, isLoading: guidesLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_guides')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data;
    }
  });

  if (categoriesLoading || guidesLoading) {
    return <LoadingSkeleton />;
  }

  const guidesByCategory = guides?.reduce((acc: GuidesByCategory, guide) => {
    const category = categories?.find(c => c.id === guide.category_id);
    if (category) {
      if (!acc[category.slug]) {
        acc[category.slug] = [];
      }
      acc[category.slug].push(guide);
    }
    return acc;
  }, {});

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
            <GuidesSection guides={guidesByCategory?.[category.slug] || []} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="w-full space-y-6">
    <Skeleton className="h-8 w-64 mb-6" />
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-[120px] flex-shrink-0" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);