import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const SearchInput = ({ placeholder = "Search...", className, ...props }: SearchInputProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className={`pl-8 ${className}`}
        {...props}
      />
    </div>
  );
};