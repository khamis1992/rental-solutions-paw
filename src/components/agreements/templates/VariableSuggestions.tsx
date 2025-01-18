import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

const variableSuggestions = {
  Agreement: [
    { name: "agreement.agreement_number", description: "Agreement reference number" },
    { name: "agreement.agreement_type", description: "Type of agreement" },
    { name: "agreement.start_date", description: "Start date of agreement" },
    { name: "agreement.end_date", description: "End date of agreement" },
    { name: "agreement.rent_amount", description: "Monthly rent amount" },
    { name: "agreement.total_amount", description: "Total agreement amount" },
    { name: "agreement.daily_late_fee", description: "Daily late fee amount" },
  ],
  Vehicle: [
    { name: "vehicle.make", description: "Vehicle manufacturer" },
    { name: "vehicle.model", description: "Vehicle model" },
    { name: "vehicle.year", description: "Vehicle year" },
    { name: "vehicle.color", description: "Vehicle color" },
    { name: "vehicle.license_plate", description: "Vehicle license plate" },
    { name: "vehicle.vin", description: "Vehicle identification number" },
  ],
  Customer: [
    { name: "customer.id", description: "Customer's unique identifier" },
    { name: "customer.full_name", description: "Customer's full name" },
    { name: "customer.phone_number", description: "Customer's phone number" },
    { name: "customer.address", description: "Customer's address" },
    { name: "customer.nationality", description: "Customer's nationality" },
    { name: "customer.email", description: "Customer's email address" },
  ],
  Payment: [
    { name: "payment.down_payment", description: "Initial down payment amount" },
    { name: "payment.monthly_payment", description: "Monthly payment amount" },
    { name: "payment.payment_due_day", description: "Day of month payment is due" },
    { name: "payment.late_fee_rate", description: "Late payment fee rate" },
    { name: "payment.grace_period", description: "Payment grace period" },
  ],
};

interface VariableSuggestionsProps {
  onVariableSelect: (variable: string) => void;
  currentContent?: string;
  cursorPosition?: number | null;
}

export const VariableSuggestions = ({ 
  onVariableSelect,
  currentContent,
  cursorPosition 
}: VariableSuggestionsProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Get the current word being typed
  const currentWord = useMemo(() => {
    if (!currentContent || cursorPosition === null || cursorPosition === undefined) return "";
    
    const beforeCursor = currentContent.slice(0, cursorPosition);
    const words = beforeCursor.split(/\s/);
    return words[words.length - 1];
  }, [currentContent, cursorPosition]);

  // Filter variables based on search term or current word
  const filterVariables = (variables: typeof variableSuggestions) => {
    const term = searchTerm || (currentWord.startsWith("{{") ? currentWord.slice(2) : "");
    if (!term) return variables;

    const filtered: Record<string, typeof variableSuggestions[keyof typeof variableSuggestions]> = {};
    
    Object.entries(variables).forEach(([category, vars]) => {
      const matchedVars = vars.filter(
        v => 
          v.name.toLowerCase().includes(term.toLowerCase()) ||
          v.description.toLowerCase().includes(term.toLowerCase())
      );
      
      if (matchedVars.length > 0) {
        filtered[category] = matchedVars;
      }
    });

    return filtered;
  };

  const filteredVariables = filterVariables(variableSuggestions);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search variables..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <ScrollArea className="h-[350px]">
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(filteredVariables).map(([category, variables]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger>{category} Variables</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-2">
                  {variables.map((variable) => (
                    <Button
                      key={variable.name}
                      variant="ghost"
                      className="justify-start text-left"
                      onClick={() => onVariableSelect(`{{${variable.name}}}`)}
                    >
                      <div>
                        <div className="font-mono text-sm">{`{{${variable.name}}}`}</div>
                        <div className="text-xs text-muted-foreground">
                          {variable.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};