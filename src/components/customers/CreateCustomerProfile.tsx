import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ContractDocumentUpload } from "./ContractDocumentUpload";

interface CustomerFormData {
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  nationality: string;
  driver_license: string;
  id_document_url: string;
  license_document_url: string;
}

export const CreateCustomerProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<CustomerFormData>({
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      address: "",
      nationality: "",
      driver_license: "",
      id_document_url: "",
      license_document_url: "",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsLoading(true);

      // Create the customer profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          ...data,
          role: 'customer',
          status: 'pending_review',
        });

      if (profileError) throw profileError;

      toast.success("Customer profile created successfully");
      form.reset();
    } catch (error: any) {
      console.error('Error creating customer profile:', error);
      toast.error(error.message || "Failed to create customer profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Create Customer Profile</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="full_name"
              rules={{ required: "Full name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              rules={{ 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              rules={{ required: "Phone number is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              rules={{ required: "Nationality is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter nationality" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver_license"
              rules={{ required: "Driver license is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver License</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter driver license number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            rules={{ required: "Address is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <ContractDocumentUpload
              label="ID Document"
              fieldName="id_document_url"
              onUploadComplete={(url) => form.setValue('id_document_url', url)}
            />

            <ContractDocumentUpload
              label="Driver License Document"
              fieldName="license_document_url"
              onUploadComplete={(url) => form.setValue('license_document_url', url)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};