// Get the current origin for postMessage security
const TRUSTED_ORIGIN = process.env.NODE_ENV === 'production' 
  ? 'https://preview-rental-solutions.lovable.app'
  : window.location.origin;

interface PostMessageData {
  type: string;
  payload: any;
}

export const sendPostMessage = (data: PostMessageData, targetWindow: Window = window.parent) => {
  console.log('Sending postMessage to:', TRUSTED_ORIGIN, 'with data:', data);
  try {
    targetWindow.postMessage(data, TRUSTED_ORIGIN);
  } catch (error) {
    console.error('Error sending postMessage:', error);
  }
};

export const addPostMessageListener = (
  callback: (event: MessageEvent) => void,
  targetWindow: Window = window
) => {
  const secureCallback = (event: MessageEvent) => {
    // Verify the origin
    if (event.origin !== TRUSTED_ORIGIN) {
      console.warn('Received message from untrusted origin:', event.origin);
      return;
    }
    
    console.log('Received postMessage from:', event.origin, 'with data:', event.data);
    callback(event);
  };

  targetWindow.addEventListener('message', secureCallback);
  return () => targetWindow.removeEventListener('message', secureCallback);
};

export const isValidOrigin = (origin: string): boolean => {
  const allowedOrigins = [
    TRUSTED_ORIGIN,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://preview-rental-solutions.lovable.app'
  ];
  
  return allowedOrigins.includes(origin);
};