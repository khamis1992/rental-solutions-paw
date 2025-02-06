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

interface WorkflowGuide {
  basics: Guide[];
  usage: Guide[];
  integration: Guide[];
}

type ModuleGuide = Guide[] | WorkflowGuide;

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

  const renderGuides = (guides: ModuleGuide) => {
    if (Array.isArray(guides)) {
      return guides.map((guide, index) => (
        <Card key={index} className="p-6">
          <h3 className="text-lg font-medium mb-4 text-right">{guide.title}</h3>
          <ol className="space-y-3">
            {guide.steps.map((step, stepIndex) => (
              <li key={stepIndex} className="flex gap-3">
                <span className="text-sm">{step}</span>
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {stepIndex + 1}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      ));
    }

    return Object.entries(guides).map(([section, sectionGuides]) => (
      <div key={section} className="space-y-4">
        <h3 className="text-lg font-semibold capitalize text-right">{section}</h3>
        {sectionGuides.map((guide, index) => (
          <Card key={index} className="p-6">
            <h4 className="text-lg font-medium mb-4 text-right">{guide.title}</h4>
            <ol className="space-y-3">
              {guide.steps.map((step, stepIndex) => (
                <li key={stepIndex} className="flex gap-3">
                  <span className="text-sm">{step}</span>
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {stepIndex + 1}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
    ));
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-semibold text-right">الدليل خطوة بخطوة</h2>
        <p className="text-muted-foreground text-right">
          أدلة شاملة لميزات النظام والعمليات
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start inline-flex">
            <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
            <TabsTrigger value="agreements">الاتفاقيات</TabsTrigger>
            <TabsTrigger value="finance">المالية</TabsTrigger>
            <TabsTrigger value="vehicles">المركبات</TabsTrigger>
            <TabsTrigger value="legal">القانونية</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {Object.entries(moduleGuides).map(([section, guides]) => (
          <TabsContent 
            key={section}
            value={section} 
            className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="space-y-4">
              {renderGuides(guides)}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};