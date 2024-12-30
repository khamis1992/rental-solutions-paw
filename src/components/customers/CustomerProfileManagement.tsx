import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreateCustomerDialog } from "./CreateCustomerDialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";

export const CustomerProfileManagement = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: profiles, isLoading, error, refetch } = useQuery({
    queryKey: ['customer-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Customer profile deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete customer profile");
    }
  };

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-4 text-red-500">
          Error loading customer profiles. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Profiles</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          Add New Customer
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading profiles...
                </TableCell>
              </TableRow>
            ) : profiles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No customer profiles found
                </TableCell>
              </TableRow>
            ) : (
              profiles?.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name}</TableCell>
                  <TableCell>{profile.phone_number}</TableCell>
                  <TableCell>
                    <Badge variant={profile.status === 'active' ? 'success' : 'secondary'}>
                      {profile.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCustomerId(profile.id);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(profile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateCustomerDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedCustomerId && (
        <CustomerDetailsDialog
          customerId={selectedCustomerId}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </div>
  );
};