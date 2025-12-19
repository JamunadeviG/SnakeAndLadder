const isProduction = import.meta.env.PROD;

// In production, we expect VITE_API_URL to be set, or we fallback to the same host (if we were using same-origin)
// But since we are deploying frontend and backend separately often, we might need a full URL.
// For now, if deployed on Netlify, we need to point to the external backend URL.
// If VITE_API_URL is not set in production, we might want to warn or default to localhost? 
// No, default to localhost only in dev.

export const API_URL = isProduction
    ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') // Fallback during testing of built app locally
    : '/api'; // Use proxy in development

export const SOCKET_URL = isProduction
    ? (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    : '/'; // Socket.io works with relative path handled by proxy
