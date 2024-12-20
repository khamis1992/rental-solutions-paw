import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AIAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFine: any;
  onAssignCustomer: (fineId: string, customerId: string) => Promise<void>;
  isAnalyzing: boolean;
  aiSuggestions: any[];
}

export const AIAssignmentDialog = ({
  open,
  onOpenChange,
  selectedFine,
  onAssignCustomer,
  isAnalyzing,
  aiSuggestions,
}: AIAssignmentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI-Powered Fine Assignment</DialogTitle>
          <DialogDescription>
            Analyzing potential matches for the traffic fine from{" "}
            {selectedFine && new Date(selectedFine.fine_date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.agreement.id}
                className={`p-4 rounded-lg border ${
                  suggestion.isRecommended ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {suggestion.agreement.customer.full_name}
                      {suggestion.isRecommended && (
                        <Badge className="ml-2 bg-primary">
                          Recommended ({Math.round(suggestion.confidence * 100)}%
                          match)
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.agreement.vehicle.make}{" "}
                      {suggestion.agreement.vehicle.model} (
                      {suggestion.agreement.vehicle.license_plate})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        suggestion.agreement.start_date
                      ).toLocaleDateString()}{" "}
                      to{" "}
                      {new Date(suggestion.agreement.end_date).toLocaleDateString()}
                    </p>
                    {suggestion.explanation && (
                      <p className="mt-2 text-sm text-primary">
                        {suggestion.explanation}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onAssignCustomer(
                        selectedFine.id,
                        suggestion.agreement.customer.id
                      )
                    }
                  >
                    Assign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};