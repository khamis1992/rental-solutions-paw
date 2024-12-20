import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TechnicalFeaturesGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication & Authorization</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>Supabase Authentication integration for secure user management</li>
            <li>Role-based access control (RBAC) with custom permissions</li>
            <li>JWT token-based session management</li>
            <li>Secure password hashing and storage</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database & Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>PostgreSQL database with real-time subscriptions</li>
            <li>Row-level security (RLS) policies for data access control</li>
            <li>Automated database migrations and version control</li>
            <li>Efficient data indexing and query optimization</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>Perplexity API integration for advanced AI analysis</li>
            <li>Document scanning and text extraction capabilities</li>
            <li>AI-powered payment reconciliation and matching</li>
            <li>Automated expense categorization and analysis</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance & Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>Real-time performance monitoring and metrics tracking</li>
            <li>Automated error logging and reporting</li>
            <li>Response time optimization and caching strategies</li>
            <li>Resource usage monitoring and optimization</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API & Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>RESTful API endpoints for external integrations</li>
            <li>Webhook support for event-driven architecture</li>
            <li>Batch processing for bulk operations</li>
            <li>API rate limiting and security measures</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Storage & Management</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure file storage with Supabase Storage</li>
            <li>Document versioning and backup systems</li>
            <li>Image optimization and processing</li>
            <li>Access control for stored files</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frontend Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>React with TypeScript for type-safe development</li>
            <li>Tailwind CSS for responsive styling</li>
            <li>shadcn/ui component library integration</li>
            <li>State management with React Query</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>XSS protection and input sanitization</li>
            <li>CSRF token implementation</li>
            <li>SQL injection prevention</li>
            <li>Regular security audits and updates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};