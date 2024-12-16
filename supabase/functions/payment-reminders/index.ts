import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentSchedule {
  id: string;
  lease_id: string;
  due_date: string;
  amount: number;
  status: string;
  reminder_count: number;
  last_reminder_sent: string | null;
}

interface LeaseWithCustomer {
  id: string;
  customer: {
    full_name: string;
    email: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get overdue payments
    const { data: overduePayments, error: paymentsError } = await supabase
      .from("payment_schedules")
      .select(`
        id,
        lease_id,
        due_date,
        amount,
        status,
        reminder_count,
        last_reminder_sent,
        leases (
          id,
          profiles (
            full_name,
            email
          )
        )
      `)
      .eq("status", "pending")
      .lt("due_date", new Date().toISOString())
      .order("due_date");

    if (paymentsError) {
      throw paymentsError;
    }

    const updatedPayments = [];
    const reminders = [];

    for (const payment of overduePayments) {
      const daysSinceLastReminder = payment.last_reminder_sent
        ? Math.floor((Date.now() - new Date(payment.last_reminder_sent).getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;

      // Send reminder if:
      // 1. No reminder sent yet, or
      // 2. 3 days since last reminder for first reminder
      // 3. 7 days since last reminder for second reminder
      // 4. 14 days since last reminder for third reminder
      const shouldSendReminder =
        !payment.last_reminder_sent ||
        (payment.reminder_count === 1 && daysSinceLastReminder >= 3) ||
        (payment.reminder_count === 2 && daysSinceLastReminder >= 7) ||
        (payment.reminder_count === 3 && daysSinceLastReminder >= 14);

      if (shouldSendReminder && payment.reminder_count < 4) {
        // Update payment schedule
        const { data: updatedPayment, error: updateError } = await supabase
          .from("payment_schedules")
          .update({
            reminder_count: payment.reminder_count + 1,
            last_reminder_sent: new Date().toISOString(),
          })
          .eq("id", payment.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating payment schedule:", updateError);
          continue;
        }

        updatedPayments.push(updatedPayment);

        // Add to reminders array for email sending
        reminders.push({
          to: payment.leases.profiles.email,
          customerName: payment.leases.profiles.full_name,
          amount: payment.amount,
          dueDate: new Date(payment.due_date).toLocaleDateString(),
          reminderCount: payment.reminder_count + 1,
        });
      }
    }

    // Send email reminders
    for (const reminder of reminders) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: [reminder.to],
            subject: `Payment Reminder #${reminder.reminderCount}`,
            html: `
              <h2>Payment Reminder</h2>
              <p>Dear ${reminder.customerName},</p>
              <p>This is a reminder that your payment of $${reminder.amount} was due on ${reminder.dueDate}.</p>
              <p>Please make your payment as soon as possible to avoid any late fees or service interruptions.</p>
              <p>If you have already made this payment, please disregard this message.</p>
              <p>Thank you for your prompt attention to this matter.</p>
            `,
          }),
        });
      } catch (error) {
        console.error("Error sending reminder email:", error);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Payment reminders processed successfully",
        reminders_sent: reminders.length,
        updated_payments: updatedPayments.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});