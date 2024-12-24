export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const isValidOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://gptengineer.app',
    'https://lovable.dev',
    'https://id-preview-7e517ebf--e43746b4-55e6-4f7b-a9c2-1c2f62d9a5b6.lovable.app'
  ];
  
  return allowedOrigins.includes(origin);
};

export const handleCorsPreflightRequest = (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  return null;
};