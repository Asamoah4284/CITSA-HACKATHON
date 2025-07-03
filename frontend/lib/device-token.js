// Generate a device token for localStorage
export const generateDeviceToken = () => {
  // Create a unique device identifier
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const userAgent = navigator.userAgent;
  const screenRes = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a fingerprint from device characteristics
  const deviceFingerprint = `${userAgent}-${screenRes}-${timezone}-${timestamp}-${random}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < deviceFingerprint.length; i++) {
    const char = deviceFingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex string
  const token = Math.abs(hash).toString(16).padStart(8, '0');
  
  return token;
};

// Get or create device token from localStorage
export const getDeviceToken = () => {
  const storageKey = 'kola_device_token';
  
  // Try to get existing token
  let deviceToken = localStorage.getItem(storageKey);
  
  // If no token exists, create one
  if (!deviceToken) {
    deviceToken = generateDeviceToken();
    localStorage.setItem(storageKey, deviceToken);
  }
  
  return deviceToken;
};

// Clear device token from localStorage
export const clearDeviceToken = () => {
  const storageKey = 'kola_device_token';
  localStorage.removeItem(storageKey);
};

// Check if device token exists
export const hasDeviceToken = () => {
  const storageKey = 'kola_device_token';
  return localStorage.getItem(storageKey) !== null;
};

// Get device information for debugging
export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    deviceToken: getDeviceToken()
  };
}; 