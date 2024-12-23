import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerFeatures {
  rental_frequency: number;
  average_rental_duration: number;
  total_spend: number;
  payment_reliability: number;
  preferred_vehicle_type: string;
}

interface SegmentationResult {
  customerId: string;
  segment: string;
  description: string;
  confidence: number;
  features: CustomerFeatures;
}

export class CustomerSegmentationService {
  static async preprocessCustomerData(customerId: string): Promise<CustomerFeatures | null> {
    try {
      // Fetch customer's rental history
      const { data: leases, error: leaseError } = await supabase
        .from('leases')
        .select(`
          *,
          payments (amount, status),
          vehicles (make, model)
        `)
        .eq('customer_id', customerId);

      if (leaseError) throw leaseError;

      if (!leases || leases.length === 0) {
        return null;
      }

      // Calculate features
      const rentalFrequency = leases.length;
      const totalDuration = leases.reduce((sum, lease) => {
        const start = new Date(lease.start_date);
        const end = new Date(lease.end_date);
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);
      
      const averageDuration = totalDuration / rentalFrequency;
      
      const totalSpend = leases.reduce((sum, lease) => sum + lease.total_amount, 0);
      
      const onTimePayments = leases.reduce((sum, lease) => {
        const payments = lease.payments as any[];
        return sum + payments.filter(p => p.status === 'completed').length;
      }, 0);
      
      const totalPayments = leases.reduce((sum, lease) => {
        const payments = lease.payments as any[];
        return sum + payments.length;
      }, 0);
      
      const paymentReliability = totalPayments > 0 ? onTimePayments / totalPayments : 0;

      // Determine preferred vehicle type
      const vehicleTypes = leases.map(lease => `${lease.vehicle.make} ${lease.vehicle.model}`);
      const preferredVehicle = vehicleTypes.sort((a, b) =>
        vehicleTypes.filter(v => v === a).length - vehicleTypes.filter(v => v === b).length
      )[0];

      return {
        rental_frequency: rentalFrequency,
        average_rental_duration: averageDuration,
        total_spend: totalSpend,
        payment_reliability: paymentReliability,
        preferred_vehicle_type: preferredVehicle,
      };
    } catch (error) {
      console.error('Error preprocessing customer data:', error);
      return null;
    }
  }

  static determineSegment(features: CustomerFeatures): SegmentationResult {
    // Simple rule-based segmentation
    // In a production environment, this would be replaced with a proper ML model
    const { rental_frequency, average_rental_duration, total_spend, payment_reliability } = features;
    
    let segment: string;
    let description: string;
    let confidence: number;

    if (rental_frequency >= 12 && payment_reliability >= 0.9) {
      segment = "High Value";
      description = "Frequent renter with excellent payment history";
      confidence = 0.9;
    } else if (rental_frequency >= 6 && payment_reliability >= 0.7) {
      segment = "Regular";
      description = "Consistent renter with good payment history";
      confidence = 0.8;
    } else if (rental_frequency >= 2) {
      segment = "Occasional";
      description = "Infrequent renter";
      confidence = 0.7;
    } else {
      segment = "New";
      description = "New or one-time customer";
      confidence = 0.6;
    }

    return {
      customerId: "", // Will be set when saving
      segment,
      description,
      confidence,
      features,
    };
  }

  static async updateCustomerSegment(customerId: string): Promise<void> {
    try {
      // Preprocess customer data
      const features = await this.preprocessCustomerData(customerId);
      
      if (!features) {
        console.log('No data available for customer:', customerId);
        return;
      }

      // Determine segment
      const result = this.determineSegment(features);
      
      // Save to database
      const { error } = await supabase
        .from('customer_segments')
        .upsert({
          customer_id: customerId,
          segment_name: result.segment,
          segment_description: result.description,
          confidence_score: result.confidence,
          features: features,
        });

      if (error) throw error;
      
      toast.success('Customer segment updated successfully');
    } catch (error) {
      console.error('Error updating customer segment:', error);
      toast.error('Failed to update customer segment');
    }
  }

  static async updateAllCustomerSegments(): Promise<void> {
    try {
      // Fetch all customers
      const { data: customers, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'customer');

      if (error) throw error;

      // Update segments for each customer
      await Promise.all(customers.map(customer => 
        this.updateCustomerSegment(customer.id)
      ));

      toast.success('All customer segments updated successfully');
    } catch (error) {
      console.error('Error updating all customer segments:', error);
      toast.error('Failed to update customer segments');
    }
  }
}