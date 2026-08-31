// Centralized API Configuration
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' &&
   window.location.hostname !== 'localhost' &&
   window.location.hostname !== '127.0.0.1'
    ? 'https://heritageguard-1.onrender.com'
    : 'http://localhost:8000');
