import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  full_name: string | null;
  role: "admin" | "staff";
  email?: string;
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch only admin and staff users from profiles
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("role", ["admin", "staff"]);

        if (error) throw error;

        // Fetch emails from auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) throw authError;

        // Combine profile data with email addresses, ensuring only admin and staff users are included
        const usersWithEmail = profiles
          .filter((profile): profile is { id: string; full_name: string | null; role: "admin" | "staff" } => 
            profile.role === "admin" || profile.role === "staff"
          )
          .map((profile) => ({
            ...profile,
            email: authUsers.users.find((user) => user.id === profile.id)?.email || "N/A",
          }));

        setUsers(usersWithEmail);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.full_name || "N/A"}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="capitalize">{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};