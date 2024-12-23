import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationType = "email" | "sms" | "both";

interface NotificationOptions {
  type: NotificationType;
  to: string | string[];
  subject?: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, any>;
  showToast?: boolean;
}

/**
 * Send a notification using the notification service
 */
export const sendNotification = async ({
  type,
  to,
  subject,
  message,
  templateId,
  templateData,
  showToast = true,
}: NotificationOptions) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification", {
      body: {
        type,
        to,
        subject,
        message,
        templateId,
        templateData,
      },
    });

    if (error) throw error;

    if (showToast) {
      toast.success("Notification sent successfully");
    }

    return data;
  } catch (error) {
    console.error("Error sending notification:", error);
    if (showToast) {
      toast.error("Failed to send notification");
    }
    throw error;
  }
};

/**
 * Predefined notification templates
 */
export const NotificationTemplates = {
  PAYMENT_DUE: {
    templateId: "d-payment-reminder",
    subject: "Payment Reminder",
    getMessage: (dueDate: string, amount: number) =>
      `Your payment of $${amount} is due on ${dueDate}`,
  },
  MAINTENANCE_SCHEDULED: {
    templateId: "d-maintenance-scheduled",
    subject: "Maintenance Scheduled",
    getMessage: (date: string, vehicle: string) =>
      `Maintenance has been scheduled for your ${vehicle} on ${date}`,
  },
  AGREEMENT_EXPIRING: {
    templateId: "d-agreement-expiring",
    subject: "Agreement Expiring Soon",
    getMessage: (expiryDate: string) =>
      `Your rental agreement is expiring on ${expiryDate}`,
  },
};

/**
 * Send a payment reminder notification
 */
export const sendPaymentReminder = async (
  to: string,
  dueDate: string,
  amount: number
) => {
  const template = NotificationTemplates.PAYMENT_DUE;
  return sendNotification({
    type: "both",
    to,
    subject: template.subject,
    message: template.getMessage(dueDate, amount),
    templateId: template.templateId,
    templateData: { dueDate, amount },
  });
};

/**
 * Send a maintenance notification
 */
export const sendMaintenanceNotification = async (
  to: string,
  date: string,
  vehicle: string
) => {
  const template = NotificationTemplates.MAINTENANCE_SCHEDULED;
  return sendNotification({
    type: "email",
    to,
    subject: template.subject,
    message: template.getMessage(date, vehicle),
    templateId: template.templateId,
    templateData: { date, vehicle },
  });
};

/**
 * Send an agreement expiry notification
 */
export const sendAgreementExpiryNotification = async (
  to: string,
  expiryDate: string
) => {
  const template = NotificationTemplates.AGREEMENT_EXPIRING;
  return sendNotification({
    type: "both",
    to,
    subject: template.subject,
    message: template.getMessage(expiryDate),
    templateId: template.templateId,
    templateData: { expiryDate },
  });
};