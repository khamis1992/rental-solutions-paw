import { CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Loader2, FileText, MessageSquare, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface SmartSearchResultsProps {
  results: any;
  isLoading: boolean;
  error: Error | null;
  onClose: () => void;
}

export const SmartSearchResults = ({
  results,
  isLoading,
  error,
  onClose
}: SmartSearchResultsProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <CommandEmpty>Error: {error.message}</CommandEmpty>;
  }

  if (!results) {
    return <CommandEmpty>Start typing to search...</CommandEmpty>;
  }

  const { cases = [], documents = [], communications = [] } = results;

  if (cases.length === 0 && documents.length === 0 && communications.length === 0) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  const handleSelect = (type: string, id: string) => {
    onClose();
    switch (type) {
      case 'case':
        navigate(`/legal/cases/${id}`);
        break;
      case 'document':
        navigate(`/legal/documents/${id}`);
        break;
      case 'communication':
        navigate(`/legal/communications/${id}`);
        break;
    }
  };

  return (
    <>
      {cases.length > 0 && (
        <CommandGroup heading="Legal Cases">
          {cases.map((item: any) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect('case', item.id)}
              className="flex items-start gap-3 p-2"
            >
              <Briefcase className="h-5 w-5 mt-1 text-muted-foreground" />
              <div className="flex flex-col">
                <div className="font-medium">
                  {item.customer?.full_name} - {item.case_type}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.description}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(item.created_at), 'PPp')}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {documents.length > 0 && (
        <CommandGroup heading="Legal Documents">
          {documents.map((item: any) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect('document', item.id)}
              className="flex items-start gap-3 p-2"
            >
              <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
              <div className="flex flex-col">
                <div className="font-medium">
                  {item.template?.name || 'Untitled Document'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.content?.substring(0, 100)}...
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(item.created_at), 'PPp')}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {communications.length > 0 && (
        <CommandGroup heading="Communications">
          {communications.map((item: any) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect('communication', item.id)}
              className="flex items-start gap-3 p-2"
            >
              <MessageSquare className="h-5 w-5 mt-1 text-muted-foreground" />
              <div className="flex flex-col">
                <div className="font-medium">
                  {item.type} Communication
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.content?.substring(0, 100)}...
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.sent_date ? format(new Date(item.sent_date), 'PPp') : 'Not sent'}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
};