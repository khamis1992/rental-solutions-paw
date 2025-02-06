import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-right">الأسئلة الشائعة</h2>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {faqs?.map((faq, index) => (
          <AccordionItem 
            key={faq.id} 
            value={`item-${index}`} 
            className="border rounded-lg px-4 hover:shadow-md transition-shadow"
          >
            <AccordionTrigger className="text-right text-base py-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm pt-2 pb-4 text-right leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};