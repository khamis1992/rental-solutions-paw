-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the payment reminders function to run daily at midnight UTC
SELECT cron.schedule(
  'process-payment-reminders',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url:='{{SUPABASE_URL}}/functions/v1/payment-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{SUPABASE_ANON_KEY}}"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);