import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const FAQSection = () => {
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['help-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_faqs')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-left">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {faqs?.map((faq, index) => (
          <AccordionItem 
            key={faq.id} 
            value={`item-${index}`} 
            className="border rounded-lg px-4 hover:shadow-md transition-shadow"
          >
            <AccordionTrigger className="text-left text-base py-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm pt-2 pb-4 text-left leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="w-full max-w-4xl space-y-4">
    <Skeleton className="h-8 w-64 mb-4" />
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg px-4 py-4">
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  </div>
);