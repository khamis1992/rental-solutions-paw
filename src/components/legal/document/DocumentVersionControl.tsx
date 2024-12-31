import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Check } from "lucide-react";
import { format } from "date-fns";

interface DocumentVersionControlProps {
  versions: Array<{
    version_number: number;
    created_at: string;
    status: string;
    changes_summary?: string;
    signature_status: string;
  }>;
  currentVersion: number;
  onVersionChange: (version: number) => void;
}

export function DocumentVersionControl({ 
  versions, 
  currentVersion,
  onVersionChange 
}: DocumentVersionControlProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <History className="h-4 w-4" />
        Version History
      </h3>
      <div className="space-y-2">
        {versions.map((version) => (
          <div 
            key={version.version_number}
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer"
            onClick={() => onVersionChange(version.version_number)}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={version.version_number === currentVersion ? "default" : "secondary"}>
                  v{version.version_number}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(version.created_at), "PP")}
                </span>
              </div>
              {version.changes_summary && (
                <p className="text-xs text-muted-foreground">{version.changes_summary}</p>
              )}
              <Badge 
                variant={version.signature_status === 'signed' ? "success" : "secondary"}
                className="text-xs"
              >
                {version.signature_status === 'signed' ? 'Signed' : 'Pending Signature'}
              </Badge>
            </div>
            {version.version_number === currentVersion && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}