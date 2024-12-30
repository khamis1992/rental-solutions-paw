-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the recurring payments processing
SELECT cron.schedule(
  'process-recurring-payments-daily',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT net.http_post(
    url:='https://vqdlsidkucrownbfuouq.supabase.co/functions/v1/process-recurring-payments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);