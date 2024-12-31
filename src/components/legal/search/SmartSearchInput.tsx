import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSmartSearch } from "./useSmartSearch";
import { SmartSearchResults } from "./SmartSearchResults";
import {
  CommandDialog,
  CommandInput,
  CommandList,
} from "@/components/ui/command";

export const SmartSearchInput = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { results, isLoading, error } = useSmartSearch(searchQuery);

  return (
    <>
      <div className="relative w-full max-w-[600px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cases, documents, communications..."
          className="pl-8 h-10"
          onClick={() => setOpen(true)}
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="max-w-[90vw] md:max-w-[800px]">
          <CommandInput 
            placeholder="Type to search..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12"
          />
          <CommandList className="max-h-[60vh] md:max-h-[500px]">
            <SmartSearchResults
              results={results}
              isLoading={isLoading}
              error={error}
              onClose={() => setOpen(false)}
            />
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
};