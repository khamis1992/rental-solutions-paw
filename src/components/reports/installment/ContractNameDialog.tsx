import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ContractNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contractName: string) => void;
}

export const ContractNameDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: ContractNameDialogProps) => {
  const [contractName, setContractName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contractName.trim()) {
      onSubmit(contractName.trim());
      setContractName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Contract Name</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contractName">Contract Name</Label>
            <Input
              id="contractName"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="Enter the contract name"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!contractName.trim()}>
              Continue to Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};