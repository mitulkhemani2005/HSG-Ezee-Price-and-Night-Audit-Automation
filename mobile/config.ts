// ============================================================
// BACKEND API URL CONFIGURATION
// ============================================================
// Currently pointing to the ngrok tunnel:
//   https://corporal-faceplate-cornhusk.ngrok-free.dev
//
// This is configured via EXPO_PUBLIC_API_URL in mobile/.env
// To change the URL, update mobile/.env:
//   EXPO_PUBLIC_API_URL=https://<your-ngrok-url>
// ============================================================

export const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Connection timeout in milliseconds (30s to handle ngrok latency)
export const API_TIMEOUT = 30000;
