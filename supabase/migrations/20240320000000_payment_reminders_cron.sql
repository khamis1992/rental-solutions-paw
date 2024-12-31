-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run at midnight on the 1st of every month
SELECT cron.schedule(
  'process-monthly-rent-payments',
  '0 0 1 * *',
  $$
  SELECT net.http_post(
    url:='https://vqdlsidkucrownbfuouq.supabase.co/functions/v1/process-rent-payments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);