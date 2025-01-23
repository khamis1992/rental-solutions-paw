import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FleetReportSectionProps } from "./types";

export const FleetReportSection = ({
  selectedReport,
  setSelectedReport,
  generateReport,
}: FleetReportSectionProps) => {
  const { data: fleetData, isLoading } = useQuery({
    queryKey: ["fleet-report", selectedReport],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fleet_reports")
        .select("*")
        .eq("report_type", selectedReport);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading fleet report...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Fleet Report: {selectedReport}</h2>
      <Button onClick={generateReport} className="mb-4">
        Generate Report
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle ID</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fleetData?.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>{vehicle.id}</TableCell>
              <TableCell>{vehicle.make}</TableCell>
              <TableCell>{vehicle.model}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>{vehicle.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
