import { differenceInMonths, isValid, parse } from "date-fns";

export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  const end = parse(endDate, "yyyy-MM-dd", new Date());
  
  if (!isValid(start) || !isValid(end)) {
    return 0;
  }
  
  // Add 1 to include both start and end months
  return Math.max(0, differenceInMonths(end, start) + 1);
};

export const calculateContractValue = (rentAmount: number, duration: number): number => {
  return rentAmount * duration;
};

export const calculateRemainingAmount = (totalAmount: number, paidAmount: number): number => {
  return Math.max(0, totalAmount - paidAmount);
};