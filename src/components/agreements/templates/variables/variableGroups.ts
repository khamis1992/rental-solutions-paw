export const defaultVariableGroups = [
  {
    name: "Agreement",
    variables: [
      { 
        key: "agreement.agreement_number", 
        description: "Unique agreement reference number",
        example: "AGR-202403-0001"
      },
      { 
        key: "agreement.start_date", 
        description: "Start date of the agreement",
        example: "01/03/2024"
      },
      { 
        key: "agreement.end_date", 
        description: "End date of the agreement",
        example: "01/03/2025"
      },
      { 
        key: "agreement.rent_amount", 
        description: "Monthly rent amount",
        example: "5,000 QAR"
      },
      { 
        key: "agreement.total_amount", 
        description: "Total agreement amount",
        example: "60,000 QAR"
      },
      { 
        key: "agreement.daily_late_fee", 
        description: "Daily late fee amount",
        example: "120 QAR"
      },
      { 
        key: "agreement.agreement_duration", 
        description: "Duration of the agreement",
        example: "12 months"
      }
    ]
  },
  {
    name: "Customer",
    variables: [
      { 
        key: "customer.full_name", 
        description: "Customer's full name",
        example: "John Smith"
      },
      { 
        key: "customer.phone_number", 
        description: "Customer's contact number",
        example: "+974 1234 5678"
      },
      { 
        key: "customer.email", 
        description: "Customer's email address",
        example: "john@example.com"
      },
      { 
        key: "customer.address", 
        description: "Customer's residential address",
        example: "123 Street Name, Doha, Qatar"
      },
      { 
        key: "customer.nationality", 
        description: "Customer's nationality",
        example: "Qatari"
      },
      { 
        key: "customer.driver_license", 
        description: "Customer's driver license number",
        example: "DL123456789"
      }
    ]
  },
  {
    name: "Vehicle",
    variables: [
      { 
        key: "vehicle.make", 
        description: "Vehicle manufacturer",
        example: "Toyota"
      },
      { 
        key: "vehicle.model", 
        description: "Vehicle model",
        example: "Camry"
      },
      { 
        key: "vehicle.year", 
        description: "Vehicle manufacturing year",
        example: "2024"
      },
      { 
        key: "vehicle.color", 
        description: "Vehicle color",
        example: "Silver"
      },
      { 
        key: "vehicle.license_plate", 
        description: "Vehicle license plate number",
        example: "ABC 123"
      },
      { 
        key: "vehicle.vin", 
        description: "Vehicle identification number",
        example: "1HGCM82633A123456"
      }
    ]
  },
  {
    name: "Payment",
    variables: [
      { 
        key: "payment.down_payment", 
        description: "Initial down payment amount",
        example: "10,000 QAR"
      },
      { 
        key: "payment.monthly_payment", 
        description: "Monthly payment amount",
        example: "5,000 QAR"
      },
      { 
        key: "payment.payment_due_day", 
        description: "Day of month payment is due",
        example: "1"
      }
    ]
  }
];