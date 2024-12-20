import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export const SystemFeaturesGuide = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            System Features Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Vehicle Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fleet inventory tracking with detailed vehicle information</li>
                <li>Real-time vehicle status monitoring (available, rented, maintenance)</li>
                <li>Maintenance scheduling and history tracking</li>
                <li>Vehicle inspection system with AI-powered damage detection</li>
                <li>Document management for vehicle-related paperwork</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Customer Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Comprehensive customer profiles with document storage</li>
                <li>AI-powered document scanning for customer identification</li>
                <li>Customer history and rental preferences tracking</li>
                <li>Risk assessment and credit scoring system</li>
                <li>Customer communication management</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Rental Agreement Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Digital agreement creation and management</li>
                <li>Automated payment scheduling and tracking</li>
                <li>Late payment handling and penalty calculation</li>
                <li>Document generation (contracts, invoices, receipts)</li>
                <li>Agreement renewal and extension processing</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. Financial Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>AI-powered accounting system for expense tracking</li>
                <li>Automated payment reconciliation</li>
                <li>Financial forecasting and reporting</li>
                <li>Revenue analysis and profit tracking</li>
                <li>Fixed and variable cost management</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">5. Maintenance Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Scheduled maintenance tracking</li>
                <li>Job card creation and management</li>
                <li>Service history documentation</li>
                <li>Parts inventory management</li>
                <li>Maintenance cost tracking</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">6. Traffic Fine Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fine recording and tracking</li>
                <li>Customer assignment and notification</li>
                <li>Payment status monitoring</li>
                <li>Bulk import of traffic fines</li>
                <li>Fine history reporting</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">7. Analytics and Reporting</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Real-time business performance dashboards</li>
                <li>AI-driven business insights</li>
                <li>Custom report generation</li>
                <li>Fleet utilization analytics</li>
                <li>Revenue and profitability analysis</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">8. Security and Access Control</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Role-based access control</li>
                <li>Secure user authentication</li>
                <li>Activity logging and audit trails</li>
                <li>Data encryption and protection</li>
                <li>System backup and recovery</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};