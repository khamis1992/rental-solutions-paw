import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SecurityVulnerabilitiesProps {
  data: any[];
}

export const SecurityVulnerabilities = ({ data }: SecurityVulnerabilitiesProps) => {
  const vulnerabilities = data?.[0]?.data_points?.security_issues || [];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Security Vulnerabilities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {vulnerabilities.map((vuln: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{vuln.title}</h3>
                  <Badge variant={vuln.severity === "high" ? "destructive" : "default"}>
                    {vuln.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{vuln.description}</p>
                <div className="mt-2 text-sm">
                  <strong>Location:</strong> {vuln.location}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};