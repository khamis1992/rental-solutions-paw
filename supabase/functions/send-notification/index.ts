import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Twilio } from "https://esm.sh/twilio@4.19.0";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = "+1234567890"; // Replace with your Twilio phone number

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "email" | "sms" | "both";
  to: string | string[];
  subject?: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

const sendEmail = async (
  to: string[],
  subject: string,
  html: string,
  templateId?: string,
  templateData?: Record<string, any>
) => {
  const emailData = templateId
    ? {
        template_id: templateId,
        personalizations: [
          {
            to: to.map(email => ({ email })),
            dynamic_template_data: templateData,
          },
        ],
      }
    : {
        to,
        subject,
        html,
      };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "notifications@yourdomain.com", // Replace with your verified sender
      ...emailData,
    }),
  });

  if (!response.ok) {
    throw new Error(`SendGrid API error: ${response.statusText}`);
  }

  return response;
};

const sendSMS = async (to: string, message: string) => {
  const client = new Twilio(TWILIO_ACCOUNT_SID!, TWILIO_AUTH_TOKEN!);
  
  const response = await client.messages.create({
    body: message,
    to,
    from: TWILIO_PHONE_NUMBER,
  });

  return response;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, subject, message, templateId, templateData }: NotificationRequest = await req.json();

    let emailResult, smsResult;

    if (type === "email" || type === "both") {
      const toEmails = Array.isArray(to) ? to : [to];
      emailResult = await sendEmail(toEmails, subject!, message, templateId, templateData);
    }

    if (type === "sms" || type === "both") {
      const toPhone = Array.isArray(to) ? to[0] : to;
      smsResult = await sendSMS(toPhone, message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: emailResult,
        sms: smsResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);