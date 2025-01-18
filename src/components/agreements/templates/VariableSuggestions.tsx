import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

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
    { name: "customer.full_name", description: "Customer's full name" },
    { name: "customer.phone_number", description: "Customer's phone number" },
    { name: "customer.address", description: "Customer's address" },
    { name: "customer.nationality", description: "Customer's nationality" },
  ],
};

interface VariableSuggestionsProps {
  onVariableSelect: (variable: string) => void;
}

export const VariableSuggestions = ({ onVariableSelect }: VariableSuggestionsProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(variableSuggestions).map(([category, variables]) => (
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
  );
};