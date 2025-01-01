import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface SecurityVulnerabilitiesProps {
  data: any[];
}

export const SecurityVulnerabilities = ({ data }: SecurityVulnerabilitiesProps) => {
  const vulnerabilities = data?.[0]?.data_points?.security_issues || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Shield className="h-4 w-4 text-green-500" />;
      default:
        return <ShieldCheck className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Security Vulnerabilities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {vulnerabilities.map((vuln: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(vuln.severity)}
                    <h3 className="font-medium">{vuln.title}</h3>
                  </div>
                  <Badge variant={getSeverityColor(vuln.severity)}>
                    {vuln.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{vuln.description}</p>
                <div className="mt-2 text-sm">
                  <strong>Location:</strong> {vuln.location}
                </div>
                {vuln.remediation && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <strong className="text-sm">Recommended Fix:</strong>
                    <p className="text-sm text-muted-foreground">{vuln.remediation}</p>
                  </div>
                )}
              </div>
            ))}
            {vulnerabilities.length === 0 && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium">No Vulnerabilities Found</h3>
                  <p className="text-sm text-muted-foreground">Your code appears to be secure</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};