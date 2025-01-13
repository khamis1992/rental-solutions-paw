# Payment Components Guidelines

## Core Principles

1. **Currency Handling**
- Always use QAR as the currency
- Utilize the `formatCurrency` utility for displaying amounts
- Handle decimal precision consistently (2 decimal places)

2. **Date Formatting**
- Use DD/MM/YYYY format consistently
- Implement date validation before submission
- Use the project's date utilities for consistency

3. **Component Structure**
- Keep components focused and under 100 lines
- Split complex components into smaller, reusable parts
- Use proper TypeScript types for all props

## Required Features

1. **Error Handling**
```typescript
// Always implement proper error states
const [error, setError] = useState<string | null>(null);
// Use toast for user feedback
toast.error("Payment processing failed");
```

2. **Loading States**
```typescript
// Always show loading states
const [isLoading, setIsLoading] = useState(false);
// Use the Loader2 component from lucide-react
<Loader2 className="h-4 w-4 animate-spin" />
```

3. **Real-time Updates**
```typescript
// Implement Supabase real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel('payment-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'unified_payments' },
      (payload) => {
        // Handle updates
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Data Management

1. **Database Interactions**
- Use the unified_payments table for all payment records
- Implement proper RLS policies
- Use transaction blocks for multiple operations

2. **State Management**
- Use React Query for server state
- Implement proper cache invalidation
- Handle optimistic updates where appropriate

## UI/UX Guidelines

1. **Forms**
```typescript
// Required form fields
- Amount
- Payment Method
- Payment Date
- Description (optional)

// Validation rules
- Amount must be positive
- Payment Date cannot be in the future
- Payment Method must be selected
```

2. **Tables**
- Include sorting functionality
- Implement pagination for large datasets
- Show totals and summaries where applicable

3. **Actions**
- Confirm destructive actions
- Show success/error feedback
- Include loading states for all actions

## Error Handling

1. **Validation Errors**
- Validate data before submission
- Show inline error messages
- Prevent form submission with invalid data

2. **API Errors**
- Handle network errors gracefully
- Show user-friendly error messages
- Log errors for debugging

## Performance

1. **Optimization**
- Implement pagination for large datasets
- Use proper React Query configurations
- Optimize re-renders

2. **Loading States**
- Show skeletons for loading states
- Implement infinite scroll where appropriate
- Handle empty states

## Security

1. **Data Protection**
- Validate all inputs
- Implement proper access control
- Use proper SQL sanitization

2. **Audit Logging**
- Log all payment actions
- Track user actions
- Maintain audit trail

## Testing Guidelines

1. **Required Tests**
- Input validation
- Payment processing
- Error handling
- Loading states

2. **Edge Cases**
- Handle network errors
- Test decimal precision
- Validate date formats

## Example Implementation

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface PaymentComponentProps {
  // Define required props
}

export const PaymentComponent = ({ ...props }: PaymentComponentProps) => {
  // Implementation following guidelines
};
```

## Accessibility

1. **Requirements**
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

2. **Form Accessibility**
- Clear error messages
- Required field indicators
- Proper input labels

## Documentation

1. **Required Documentation**
- Component purpose
- Props interface
- Usage examples
- Error handling