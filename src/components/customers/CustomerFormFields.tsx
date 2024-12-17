import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomerDocumentUpload } from "./CustomerDocumentUpload";
import { UseFormReturn } from "react-hook-form";

interface CustomerFormFieldsProps {
  form: UseFormReturn<any>;
}

export const CustomerFormFields = ({ form }: CustomerFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input placeholder="+1 234 567 890" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="driver_license"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Driver License</FormLabel>
            <FormControl>
              <Input placeholder="DL12345678" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="id_document_url"
        render={({ field }) => (
          <CustomerDocumentUpload
            label="ID Document"
            fieldName="id_document_url"
            onUploadComplete={field.onChange}
          />
        )}
      />
      <FormField
        control={form.control}
        name="license_document_url"
        render={({ field }) => (
          <CustomerDocumentUpload
            label="Driver License Document"
            fieldName="license_document_url"
            onUploadComplete={field.onChange}
          />
        )}
      />
    </>
  );
};