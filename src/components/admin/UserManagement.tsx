import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagementSettings } from "../settings/UserManagementSettings";

export const UserManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <UserManagementSettings />
      </CardContent>
    </Card>
  );
};