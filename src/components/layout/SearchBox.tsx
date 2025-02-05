import { Search } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SearchBoxProps {
  placeholder?: string;
}

export function SearchBox({ placeholder }: SearchBoxProps) {
  const { dir } = useTranslation();
  const isRTL = dir() === 'rtl';

  return (
    <div className={`relative ${isRTL ? 'rtl' : ''}`}>
      <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground`} />
      <input
        type="search"
        placeholder={placeholder}
        className={`h-9 w-64 rounded-md border border-input bg-background ${isRTL ? 'pr-9' : 'pl-9'} ${isRTL ? 'pl-3' : 'pr-3'} text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
      />
    </div>
  );
}