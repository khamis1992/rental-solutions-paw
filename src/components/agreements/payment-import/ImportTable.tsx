import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportTableProps {
  headers: string[];
  data: any[];
}

export const ImportTable = ({ headers, data }: ImportTableProps) => {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imported Raw Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={`${index}-${header}`}>
                      {row[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};