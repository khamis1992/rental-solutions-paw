import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateUserForm } from "./users/CreateUserForm";
import { UserList } from "./users/UserList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const UserManagementSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Create new user accounts and manage roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">User List</TabsTrigger>
            <TabsTrigger value="create">Create User</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <UserList />
          </TabsContent>
          <TabsContent value="create">
            <CreateUserForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};