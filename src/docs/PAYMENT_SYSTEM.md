# Payment System Technical Documentation

## Table Structure

### 1. Unified Payments Table (`unified_payments`)
Primary table for all payment transactions with the following key features:
- Tracks basic payment information (amount, dates, methods)
- Handles payment status management
- Stores late fine calculations
- Manages reconciliation status
- Links to agreements and security deposits

Key Fields:
```sql
- id: UUID (Primary Key)
- lease_id: UUID (Foreign Key to leases)
- amount: Numeric
- amount_paid: Numeric
- balance: Numeric
- payment_date: Timestamp
- due_date: Timestamp
- transaction_id: Text
- payment_method: PaymentMethodType
- status: PaymentStatus
- late_fine_amount: Numeric
- days_overdue: Integer
```

### 2. Import Tracking (`unified_import_tracking`)
Centralized system for tracking payment imports:
- Manages import validation
- Tracks processing attempts
- Stores error information
- Handles batch processing

Key Fields:
```sql
- id: UUID (Primary Key)
- batch_id: UUID
- transaction_id: Text
- agreement_number: Text
- amount: Numeric
- status: ImportStatusType
- validation_status: Boolean
- processing_attempts: Integer
```

### 3. Payment Schedules (`payment_schedules`)
Manages upcoming and recurring payments:
- Tracks due dates
- Handles payment amounts
- Manages reminder status
- Tracks reconciliation

Key Fields:
```sql
- id: UUID (Primary Key)
- lease_id: UUID
- due_date: Timestamp
- amount: Numeric
- status: PaymentStatus
- reconciliation_status: Text
```

### 4. Audit Logging (`payment_audit_logs`)
Comprehensive tracking of all payment-related changes:
- Records all modifications
- Stores previous and new states
- Tracks user actions
- Maintains metadata

Key Fields:
```sql
- id: UUID (Primary Key)
- payment_id: UUID
- action: Text
- previous_state: JSONB
- new_state: JSONB
- performed_by: UUID
```

## Workflows

### 1. Payment Processing
1. Payment creation through:
   - Manual entry
   - Import process
   - Recurring schedule
2. Validation and status updates
3. Late fine calculation (if applicable)
4. Audit log creation
5. Balance updates

### 2. Import Process
1. File upload to unified import tracking
2. Validation checks:
   - Agreement number verification
   - Amount validation
   - Duplicate detection
3. Processing attempts with retry mechanism
4. Error handling and logging
5. Success confirmation and cleanup

### 3. Reconciliation Process
1. Payment matching with schedules
2. Status updates
3. Balance recalculation
4. Audit log creation
5. Error handling

## Error Handling

### Import Errors
- Validation failures logged with details
- Retry mechanism for failed imports
- Error categorization for reporting
- User notification system

### Processing Errors
- Transaction rollback on failures
- Detailed error logging
- Retry mechanisms
- Admin notifications

## Best Practices

### 1. Data Entry
- Always use transaction blocks
- Validate input data
- Handle currency precision
- Use appropriate payment methods
- Include reference numbers

### 2. Error Handling
- Log all errors
- Use retry mechanisms
- Maintain audit trails
- Handle edge cases

### 3. Performance
- Index key fields
- Use batch processing
- Implement caching
- Regular maintenance

## Migration Guide

### For Future Updates
1. Always create backup before migration
2. Use transaction blocks
3. Validate data before and after
4. Update related components
5. Test thoroughly
6. Document changes

## API Integration

### Endpoints
- POST /api/payments
- GET /api/payments
- PUT /api/payments/:id
- DELETE /api/payments/:id

### Authentication
- Required for all endpoints
- Role-based access control
- Token validation

## Security Considerations

### Data Protection
- Encryption at rest
- Secure transmission
- Access control
- Audit logging

### Compliance
- Data retention policies
- Privacy requirements
- Regulatory compliance
- Regular audits

## Monitoring

### Key Metrics
- Processing time
- Error rates
- Success rates
- System performance

### Alerts
- Error thresholds
- Performance issues
- Security events
- System health

## Support and Maintenance

### Regular Tasks
- Log rotation
- Performance optimization
- Data cleanup
- System updates

### Troubleshooting
- Common issues
- Resolution steps
- Escalation procedures
- Contact information