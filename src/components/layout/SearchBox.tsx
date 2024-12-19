import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBox = () => {
  return (
    <div className="relative w-[300px]">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Search..."
        className="pl-8 pr-4 h-9 w-full"
      />
    </div>
  );
};