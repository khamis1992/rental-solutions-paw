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
                <li>AI-powered financial analysis and insights</li>
                <li>Real-time cost impact assessment</li>
                <li>Industry comparison and benchmarking</li>
                <li>Predictive financial trends and forecasting</li>
                <li>Automated expense categorization and tracking</li>
                <li>Cost optimization recommendations</li>
                <li>Comprehensive financial reporting</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">5. AI and Automation</h3>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2 list-disc pl-4">
                <li>Perplexity AI integration for advanced analytics</li>
                <li>Automated financial health monitoring</li>
                <li>Smart cost optimization suggestions</li>
                <li>Predictive maintenance scheduling</li>
                <li>Document analysis and data extraction</li>
                <li>Natural language query processing</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};