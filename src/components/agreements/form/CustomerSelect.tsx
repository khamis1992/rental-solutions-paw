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
import { Label } from "@/components/ui/label";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { useCustomerSearch } from "./hooks/useCustomerSearch";
import { CustomerSelectProps } from "./types/customerSelect.types";

export const CustomerSelect = ({ register, onCustomerSelect }: CustomerSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    full_name: string;
  } | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    showCreateCustomer,
    setShowCreateCustomer
  } = useCustomerSearch(searchQuery);

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
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading customers...
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-sm text-red-500">
                      Error loading customers. Please try again.
                    </div>
                  ) : searchQuery ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        No customers found matching "{searchQuery}"
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleCreateNewCustomer}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create New Customer
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Start typing to search customers
                      </p>
                      <Button
                        variant="outline"
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
                      className="cursor-pointer"
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