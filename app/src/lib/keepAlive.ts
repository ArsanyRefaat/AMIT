import { API_BASE } from './api';

/**
 * Keep the Render server awake by pinging it every 5 minutes.
 * This prevents the free-tier server from spinning down due to inactivity.
 */
export function startKeepAlive(): void {
  if (typeof window === 'undefined') return;

  const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  const ping = () => {
    fetch(`${API_BASE}/api/health`, { 
      cache: 'no-store',
      method: 'GET'
    }).catch(() => {
      // Silently fail - the ping is just to keep server awake
      console.debug('Keep-alive ping failed, will retry');
    });
  };

  // Start pinging every 5 minutes
  const intervalId = setInterval(ping, PING_INTERVAL);

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });

  console.log('✅ Server keep-alive started (pinging every 5 minutes)');
}
