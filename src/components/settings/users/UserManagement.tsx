import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "./UserList";
import { CreateUserForm } from "./CreateUserForm";
import { useToast } from "@/components/ui/use-toast";

export const UserManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");

  // Fetch current user's role to determine permissions
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    }
  });

  const isAdmin = currentUserProfile?.role === 'admin';

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Manage staff and customer accounts" 
            : "View users and manage customer accounts"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">User List</TabsTrigger>
            <TabsTrigger value="create">Create User</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <UserList isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="create">
            <CreateUserForm isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};