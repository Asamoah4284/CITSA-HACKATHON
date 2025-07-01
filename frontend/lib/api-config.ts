// Backend API configuration utility
export const getBackendUrl = (): string => {
  // Check for environment-specific backend URL
  const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  
  // Use environment variable if available, otherwise use Render production URL
  const backendUrl = envBackendUrl || 'https://citsa-hackathon-2.onrender.com';
  
  // Add logging to validate configuration
  console.log('🔧 Backend URL Configuration:');
  console.log('  - NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
  console.log('  - BACKEND_URL:', process.env.BACKEND_URL);
  console.log('  - Environment Backend URL:', envBackendUrl);
  console.log('  - Final Backend URL:', backendUrl);
  console.log('  - Node Environment:', process.env.NODE_ENV);
  console.log('  - Is Development:', process.env.NODE_ENV === 'development');
  
  return backendUrl;
};

// Helper function for API endpoints
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getBackendUrl();
  const fullUrl = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  console.log('🔗 Generated API URL:', fullUrl);
  return fullUrl;
};

// Test function to validate configuration
export const testApiConfiguration = (): void => {
  console.log('🧪 Testing API Configuration...');
  console.log('  - Environment:', process.env.NODE_ENV);
  console.log('  - NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
  console.log('  - BACKEND_URL:', process.env.BACKEND_URL);
  console.log('  - Final Backend URL:', getBackendUrl());
  console.log('  - Sample API URL:', getApiUrl('/auth/login'));
}; 