/**
 * Calculates the contract value based on rent amount and duration
 */
export const calculateContractValue = (rentAmount: number, duration: string): number => {
  // Extract the number and unit from duration string (e.g., "3 years" -> 3)
  const durationMatch = duration.match(/(\d+)/);
  const durationNumber = durationMatch ? parseInt(durationMatch[1]) : 3; // Default to 3 if not found
  
  // Calculate monthly payments for the entire duration
  const monthlyPayments = rentAmount * (durationNumber * 12);
  
  return monthlyPayments;
};

/**
 * Calculates the remaining amount based on contract value and total payments
 */
export const calculateRemainingAmount = (contractValue: number, totalPayments: number): number => {
  return Math.max(0, contractValue - totalPayments);
};