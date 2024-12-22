import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FeatureGuides = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold">Feature Documentation</h2>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="dashboard" className="border rounded-lg px-6">
          <AccordionTrigger className="text-left text-lg py-6">Dashboard Overview</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <h3 className="text-xl font-medium">Navigating the Dashboard</h3>
            <p className="text-base">The dashboard provides a comprehensive overview of your rental operations:</p>
            <ul className="list-disc pl-8 space-y-3 text-base">
              <li>Real-time metrics showing active rentals, revenue, and fleet status</li>
              <li>Quick access to recent activities and pending tasks</li>
              <li>Interactive charts displaying key performance indicators</li>
              <li>Customizable widgets for personalized monitoring</li>
              <li>Alert system for important notifications</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="customers" className="border rounded-lg px-6">
          <AccordionTrigger className="text-left text-lg py-6">Customer Management</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <h3 className="text-xl font-medium">Managing Customer Information</h3>
            <p className="text-base">Comprehensive tools for customer relationship management:</p>
            <ul className="list-disc pl-8 space-y-3 text-base">
              <li>Create and maintain detailed customer profiles</li>
              <li>Document management for licenses and identification</li>
              <li>Track rental history and payment records</li>
              <li>Risk assessment and credit scoring</li>
              <li>Customer communication logs</li>
              <li>Status tracking and updates</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="agreements" className="border rounded-lg px-6">
          <AccordionTrigger className="text-left text-lg py-6">Rental Agreements</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <h3 className="text-xl font-medium">Agreement Management</h3>
            <p className="text-base">Complete rental agreement lifecycle management:</p>
            <ul className="list-disc pl-8 space-y-3 text-base">
              <li>Create new agreements with flexible terms</li>
              <li>Multiple agreement types (short-term, lease-to-own)</li>
              <li>Automated payment scheduling</li>
              <li>Document generation and storage</li>
              <li>Extension and modification handling</li>
              <li>Early termination processing</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="finance" className="border rounded-lg px-6">
          <AccordionTrigger className="text-left text-lg py-6">Finance Module</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <h3 className="text-xl font-medium">Financial Management</h3>
            <p className="text-base">Comprehensive financial tools and tracking:</p>
            <ul className="list-disc pl-8 space-y-3 text-base">
              <li>Revenue tracking and forecasting</li>
              <li>Expense management (Fixed vs Variable Costs)</li>
              <li>Payment processing and reconciliation</li>
              <li>Invoice generation and management</li>
              <li>Financial reporting and analytics</li>
              <li>AI-powered financial insights</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vehicles" className="border rounded-lg px-6">
          <AccordionTrigger className="text-left text-lg py-6">Vehicle Management</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <h3 className="text-xl font-medium">Fleet Operations</h3>
            <p className="text-base">Complete vehicle fleet management system:</p>
            <ul className="list-disc pl-8 space-y-3 text-base">
              <li>Vehicle inventory tracking</li>
              <li>Maintenance scheduling and history</li>
              <li>Document management (registration, insurance)</li>
              <li>Vehicle inspection tools</li>
              <li>Availability tracking and scheduling</li>
              <li>Damage reporting and repair tracking</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="legal" className="border rounded-lg px-6">
          <AccordionTrigger className="text-left text-lg py-6">Legal Management</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <h3 className="text-xl font-medium">Legal Operations</h3>
            <p className="text-base">Tools for managing legal aspects of rental operations:</p>
            <ul className="list-disc pl-8 space-y-3 text-base">
              <li>Compliance monitoring and tracking</li>
              <li>Legal document management</li>
              <li>Case management for disputes</li>
              <li>Non-compliant customer tracking</li>
              <li>Legal notice generation</li>
              <li>Audit trail maintenance</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reports" className="border rounded-lg px-6">
          <AccordionTrigger className="text-left text-lg py-6">Reports & Analytics</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <h3 className="text-xl font-medium">Business Intelligence</h3>
            <p className="text-base">Comprehensive reporting and analysis tools:</p>
            <ul className="list-disc pl-8 space-y-3 text-base">
              <li>Custom report generation</li>
              <li>Performance analytics and KPIs</li>
              <li>Financial analysis and forecasting</li>
              <li>Fleet utilization reports</li>
              <li>Customer behavior analysis</li>
              <li>AI-powered business insights</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="settings" className="border rounded-lg px-6">
          <AccordionTrigger className="text-left text-lg py-6">System Settings</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <h3 className="text-xl font-medium">System Configuration</h3>
            <p className="text-base">Customize and configure system settings:</p>
            <ul className="list-disc pl-8 space-y-3 text-base">
              <li>User management and access control</li>
              <li>Company information settings</li>
              <li>Notification preferences</li>
              <li>Integration management</li>
              <li>System preferences</li>
              <li>Backup and maintenance options</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
