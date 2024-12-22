import React, { useState, useEffect } from "react";
import { Button as BaseButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface EnhancedButtonProps extends React.ComponentPropsWithoutRef<typeof BaseButton> {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  successText?: string;
  errorText?: string;
  loadingText?: string;
  duration?: number;
  onStateEnd?: () => void;
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      children,
      className,
      loading = false,
      success = false,
      error = false,
      successText = "Success!",
      errorText = "Error",
      loadingText = "Loading...",
      duration = 2000,
      onStateEnd,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
      if (success) {
        setShowSuccess(true);
        const timer = setTimeout(() => {
          setShowSuccess(false);
          onStateEnd?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [success, duration, onStateEnd]);

    useEffect(() => {
      if (error) {
        setShowError(true);
        const timer = setTimeout(() => {
          setShowError(false);
          onStateEnd?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [error, duration, onStateEnd]);

    const getButtonContent = () => {
      if (loading) {
        return (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </span>
        );
      }

      if (showSuccess) {
        return (
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {successText}
          </span>
        );
      }

      if (showError) {
        return (
          <span className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {errorText}
          </span>
        );
      }

      return children;
    };

    const getButtonVariant = () => {
      if (showSuccess) return "success";
      if (showError) return "destructive";
      return props.variant || "default";
    };

    return (
      <BaseButton
        ref={ref}
        className={cn(
          "relative transition-all duration-200",
          loading && "cursor-not-allowed opacity-80",
          showSuccess && "bg-green-600 hover:bg-green-700",
          showError && "bg-red-600 hover:bg-red-700",
          className
        )}
        disabled={disabled || loading}
        variant={getButtonVariant()}
        {...props}
      >
        {getButtonContent()}
      </BaseButton>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";