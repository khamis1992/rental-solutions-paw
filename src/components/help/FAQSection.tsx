import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I create a new rental agreement?",
    answer: "To create a new rental agreement, navigate to the Agreements page and click the 'Create Agreement' button. Fill in the required information including customer details, vehicle selection, and rental terms. Review the information and submit the form to create the agreement."
  },
  {
    question: "How can I track vehicle maintenance?",
    answer: "Vehicle maintenance can be tracked through the Maintenance section. You can view scheduled maintenance, create new maintenance records, and track service history for each vehicle in your fleet."
  },
  {
    question: "How do I generate reports?",
    answer: "Navigate to the Reports & Analytics page where you can generate various reports including fleet status, financial reports, and customer analytics. Select the desired report type and date range, then click 'Generate Report'."
  },
  {
    question: "How do I manage customer profiles?",
    answer: "Customer profiles can be managed through the Customers page. You can add new customers, update existing information, view rental history, and manage documents associated with each customer."
  },
  {
    question: "How do I handle vehicle inspections?",
    answer: "Vehicle inspections are managed through the Vehicles section. You can create new inspection records, upload photos, document damage, and generate inspection reports for both check-in and check-out processes."
  }
];

export const FAQSection = () => {
  return (
    <div className="w-full max-w-4xl space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-left">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
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