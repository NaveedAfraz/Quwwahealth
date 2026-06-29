// Configuration file for environment variables and API settings
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  
  // App Configuration
  APP_NAME: 'Quwwa Health',
  APP_VERSION: '1.0.0',
};

export default config; 