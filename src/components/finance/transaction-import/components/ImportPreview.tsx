import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface ImportPreviewProps {
  data: any[];
  onImport: () => void;
  isImporting: boolean;
}

export const ImportPreview = ({ data, onImport, isImporting }: ImportPreviewProps) => {
  if (!data.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Data ({data.length} rows)</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(data[0]).map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value: any, cellIndex) => (
                    <TableCell key={cellIndex}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="mt-4 flex justify-end">
          <Button onClick={onImport} disabled={isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Data'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};