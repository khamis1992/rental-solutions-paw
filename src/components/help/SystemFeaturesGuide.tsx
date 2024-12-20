import { Card, CardContent } from "@/components/ui/card";

export const SystemFeaturesGuide = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">System Features</h2>
        <p className="text-muted-foreground mb-6">System Features Overview</p>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-3">1. Vehicle Management</h3>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2 list-disc pl-4">
                <li>Fleet inventory tracking with detailed vehicle information</li>
                <li>Real-time vehicle status monitoring (available, rented, maintenance)</li>
                <li>Maintenance scheduling and history tracking</li>
                <li>Vehicle inspection system with AI-powered damage detection</li>
                <li>Document management for vehicle-related paperwork</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">2. Customer Management</h3>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2 list-disc pl-4">
                <li>Comprehensive customer profiles with document storage</li>
                <li>AI-powered document scanning for customer identification</li>
                <li>Customer history and rental preferences tracking</li>
                <li>Risk assessment and credit scoring system</li>
                <li>Customer communication management</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">3. Rental Agreement Management</h3>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2 list-disc pl-4">
                <li>Digital agreement creation and management</li>
                <li>Automated payment scheduling and tracking</li>
                <li>Late payment handling and penalty calculation</li>
                <li>Document generation (contracts, invoices, receipts)</li>
                <li>Agreement renewal and extension processing</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">4. Financial Management</h3>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2 list-disc pl-4">
                <li>AI-powered accounting system for expense tracking</li>
                <li>Automated payment reconciliation</li>
                <li>Financial forecasting and reporting</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};