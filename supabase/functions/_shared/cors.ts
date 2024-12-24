export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Helper function to validate origin
export const isValidOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://gptengineer.app',
    'https://lovable.dev'
  ];
  
  return allowedOrigins.includes(origin);
};

// Helper function to handle CORS preflight requests
export const handleCorsPreflightRequest = (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  return null;
};