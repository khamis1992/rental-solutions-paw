import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import { isValidDateFormat, parseDateFromDisplay, formatDateToDisplay } from "@/lib/dateUtils";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onDateChange?: (date: Date | null) => void;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, error, value, onChange, onDateChange, ...props }, ref) => {
    const [inputValue, setInputValue] = useState(value as string || '');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
      // Update input value when value prop changes
      if (value && typeof value === 'string') {
        setInputValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Clear validation error while typing
      if (validationError) setValidationError('');

      // Call original onChange if provided
      if (onChange) onChange(e);

      // Validate complete date
      if (newValue.length === 10) {
        if (isValidDateFormat(newValue)) {
          const date = parseDateFromDisplay(newValue);
          if (onDateChange) onDateChange(date);
          setValidationError('');
        } else {
          setValidationError('Please enter a valid date in DD/MM/YYYY format');
          if (onDateChange) onDateChange(null);
        }
      }
    };

    const handleBlur = () => {
      if (inputValue && !isValidDateFormat(inputValue)) {
        setValidationError('Please enter a valid date in DD/MM/YYYY format');
        if (onDateChange) onDateChange(null);
      }
    };

    return (
      <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <Input
          {...props}
          ref={ref}
          type="text"
          placeholder="DD/MM/YYYY"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "w-full",
            error || validationError ? "border-red-500" : "",
            className
          )}
        />
        {(error || validationError) && (
          <p className="text-sm text-red-500">{error || validationError}</p>
        )}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";