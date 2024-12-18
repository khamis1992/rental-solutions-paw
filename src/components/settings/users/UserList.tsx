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
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, email")
          .in("role", ["admin", "staff"]);

        if (error) throw error;

        // Type assertion to ensure profiles match User interface
        const typedUsers = profiles.filter((profile): profile is User => 
          profile.role === "admin" || profile.role === "staff"
        );

        setUsers(typedUsers);
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
            <TableCell>{user.email || "N/A"}</TableCell>
            <TableCell className="capitalize">{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};