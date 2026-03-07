/**
 * Centralized logging and event tracking utility.
 */

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO][${new Date().toISOString()}] ${message}`, data || "");
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN][${new Date().toISOString()}] ${message}`, data || "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR][${new Date().toISOString()}] ${message}`, error || "");
  },
  track: (event: string, properties?: any) => {
    // This can be expanded to send events to an external service like Mixpanel or PostHog
    console.log(`[TRACK][${new Date().toISOString()}] Event: ${event}`, properties || "");
  }
};
