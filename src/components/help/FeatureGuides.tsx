import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FeatureGuides = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Feature Documentation</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="dashboard">
          <AccordionTrigger>Dashboard Overview</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <h3 className="font-medium">Navigating the Dashboard</h3>
            <p>The dashboard provides a comprehensive overview of your rental operations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View key metrics including active rentals and revenue</li>
              <li>Monitor vehicle status and availability</li>
              <li>Track upcoming returns and maintenance schedules</li>
              <li>Access quick actions for common tasks</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="finance">
          <AccordionTrigger>Finance Module</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <h3 className="font-medium">Managing Finances</h3>
            <p>The finance module helps you manage all financial aspects:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Add and categorize transactions (Fixed vs Variable Costs)</li>
              <li>Generate financial reports and analytics</li>
              <li>Track revenue, expenses, and profit margins</li>
              <li>Manage recurring transactions and payment schedules</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="customers">
          <AccordionTrigger>Customer Management</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <h3 className="font-medium">Managing Customers</h3>
            <p>Efficiently manage customer information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Add and edit customer profiles</li>
              <li>Upload and verify customer documents</li>
              <li>Track rental history and payment records</li>
              <li>Manage customer communications</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="agreements">
          <AccordionTrigger>Agreements Module</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <h3 className="font-medium">Managing Rental Agreements</h3>
            <p>Create and manage rental agreements:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create new agreements with auto-filled customer data</li>
              <li>Set rental duration and payment terms</li>
              <li>Select vehicles and add optional services</li>
              <li>Generate and print agreement documents</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vehicles">
          <AccordionTrigger>Vehicle Management</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <h3 className="font-medium">Managing Vehicles</h3>
            <p>Keep track of your vehicle fleet:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Add and update vehicle information</li>
              <li>Track maintenance schedules</li>
              <li>Monitor vehicle availability</li>
              <li>Manage vehicle documents and inspections</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};