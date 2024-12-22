import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";

interface CustomerSelectProps {
  register: any;
  onCustomerSelect?: (customerId: string) => void;
}

const PAGE_SIZE = 10;

export const CustomerSelect = ({ register, onCustomerSelect }: CustomerSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    full_name: string;
  } | null>(null);

  // Use infinite query for pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const trimmedQuery = searchQuery.trim();
        console.log("Fetching customers page", pageParam, "with query:", trimmedQuery);
        
        let query = supabase
          .from('profiles')
          .select('id, full_name, email, phone_number', { count: 'exact' })
          .eq('role', 'customer')
          .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

        if (trimmedQuery) {
          query = query.or(
            `full_name.ilike.%${trimmedQuery}%,` +
            `email.ilike.%${trimmedQuery}%,` +
            `phone_number.ilike.%${trimmedQuery}%`
          );
        }

        const { data: customers, count, error } = await query;

        if (error) {
          console.error("Error fetching customers:", error);
          toast.error("Failed to fetch customers");
          throw error;
        }

        console.log("Fetched customers:", {
          page: pageParam,
          count: customers?.length || 0,
          totalCount: count,
          query: trimmedQuery
        });

        return {
          customers: customers || [],
          nextPage: customers?.length === PAGE_SIZE ? pageParam + 1 : undefined,
          totalCount: count
        };
      } catch (err) {
        console.error("Error in customer search:", err);
        toast.error("Failed to search customers");
        throw err;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 30000,
    retry: 1,
  });

  const handleSelect = (customer: { id: string; full_name: string }) => {
    console.log("Selected customer:", customer);
    setSelectedCustomer(customer);
    register("customerId").onChange({ target: { value: customer.id } });
    if (onCustomerSelect) {
      onCustomerSelect(customer.id);
    }
    setOpen(false);
  };

  const handleCreateNewCustomer = () => {
    setShowCreateCustomer(true);
    setOpen(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      console.log("Reached bottom, loading more customers");
      fetchNextPage();
    }
  };

  const allCustomers = data?.pages.flatMap(page => page.customers) || [];

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="customerId">Customer</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedCustomer ? selectedCustomer.full_name : "Select customer..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput 
                placeholder="Search customers..." 
                value={searchQuery}
                onValueChange={(value) => {
                  console.log("Search value changed:", value);
                  setSearchQuery(value);
                }}
              />
              <CommandList className="max-h-[300px] overflow-y-auto" onScroll={handleScroll}>
                <CommandEmpty>
                  {isLoading ? (
                    "Loading customers..."
                  ) : error ? (
                    "Error loading customers"
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No customers found
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={handleCreateNewCustomer}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create New Customer
                      </Button>
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {allCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={() => handleSelect(customer)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCustomer?.id === customer.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{customer.full_name}</span>
                        {customer.email && (
                          <span className="text-sm text-muted-foreground">
                            {customer.email}
                          </span>
                        )}
                        {customer.phone_number && (
                          <span className="text-sm text-muted-foreground">
                            {customer.phone_number}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {isFetchingNextPage && (
                    <div className="py-2 text-center text-sm text-muted-foreground">
                      Loading more customers...
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <CreateCustomerDialog 
        open={showCreateCustomer} 
        onOpenChange={setShowCreateCustomer}
      />
    </>
  );
};