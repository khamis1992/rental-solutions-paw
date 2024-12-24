import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ContractDocumentUpload } from "./ContractDocumentUpload";

interface CustomerFormFieldsProps {
  form: UseFormReturn<any>;
}

export const CustomerFormFields = ({ form }: CustomerFormFieldsProps) => {
  return (
    <div className="space-y-4">
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
              <Input type="email" placeholder="Enter email address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone_number"
        rules={{ 
          required: "Phone number is required",
          pattern: {
            value: /^[0-9+\-\s()]*$/,
            message: "Invalid phone number format"
          }
        }}
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
        name="address"
        rules={{ required: "Address is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter full address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
  );
};