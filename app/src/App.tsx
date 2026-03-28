import { useState, useEffect } from 'react';
import { EntryPage } from '@/pages/EntryPage';
import { LoginPage } from '@/pages/LoginPage';
import { WebsiteApp } from '@/website/WebsiteApp';
import { CRMApp } from '@/crm/CRMApp';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';
import { clearStoredAuth } from '@/lib/authSession';

type AppView = 'entry' | 'website' | 'crm' | 'login' | 'loading';
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_LAST_ACTIVITY_KEY = 'authLastActivity';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const markSessionActivity = () => {
  localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, String(Date.now()));
};

const hasActiveSession = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;

  const lastActivityRaw = localStorage.getItem(AUTH_LAST_ACTIVITY_KEY);
  const lastActivity = lastActivityRaw ? Number(lastActivityRaw) : Date.now();
  if (!lastActivityRaw) markSessionActivity();

  if (!Number.isFinite(lastActivity)) {
    markSessionActivity();
    return true;
  }

  if (Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
    clearStoredAuth();
    return false;
  }

  return true;
};

const validateSessionWithApi = async () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;

  try {
    const res = await fetch(`${API_BASE}/api/auth/session-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      clearStoredAuth();
      return false;
    }
    markSessionActivity();
    return true;
  } catch {
    // If network is down, keep local session and avoid unexpected forced logout.
    return true;
  }
};

function App() {
  const [currentView, setCurrentView] = useState<AppView>('loading');

  useEffect(() => {
    // Check URL for direct access
    const path = window.location.pathname;
    if (path === '/' || path === '/website' || path === '/site') {
      setCurrentView('website');
      return;
    }

    if (path === '/login') {
      setCurrentView('login');
      return;
    }

    // Secret Business Development portal (not linked from public site)
    if (path === '/entry') {
      setCurrentView('entry');
      return;
    }

    if (path === '/crm' || path === '/admin' || path === '/dashboard') {
      if (!hasActiveSession()) {
        setCurrentView('login');
        return;
      }

      // Show CRM immediately (no website flash), then validate session in background.
      setCurrentView('crm');
      void validateSessionWithApi().then((valid) => {
        if (valid) return;
        setCurrentView('login');
        window.history.pushState({}, '', '/login');
      });
      return;
    }

    setCurrentView('website');
  }, []);

  useEffect(() => {
    if (currentView !== 'crm') return;

    let lastWrite = 0;
    const writeActivityThrottled = () => {
      const now = Date.now();
      if (now - lastWrite < 15000) return; // avoid writing on every mousemove event
      lastWrite = now;
      markSessionActivity();
    };

    const verifySession = () => {
      if (hasActiveSession()) return;
      setCurrentView('login');
      window.history.pushState({}, '', '/login');
      toast.info('Session expired due to inactivity. Please sign in again.');
    };

    const events: (keyof WindowEventMap)[] = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, writeActivityThrottled, { passive: true }));
    window.addEventListener('focus', verifySession);
    const intervalId = window.setInterval(verifySession, 60000);
    markSessionActivity();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, writeActivityThrottled));
      window.removeEventListener('focus', verifySession);
      window.clearInterval(intervalId);
    };
  }, [currentView]);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    if (view === 'crm') markSessionActivity();
    let path = '/';
    if (view === 'entry') path = '/entry';
    else if (view === 'website') path = '/';
    else path = `/${view}`;
    window.history.pushState({}, '', path);
  };

  const handleLogin = (_auth: { token: string; roles: string[]; email: string; userId: string }) => {
    markSessionActivity();
  };

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentView('login');
    window.history.pushState({}, '', '/login');
  };

  return (
    <>
      {currentView === 'entry' && <EntryPage onNavigate={handleNavigate} />}
      {currentView === 'login' && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
      {currentView === 'website' && <WebsiteApp />}
      {currentView === 'crm' && <CRMApp onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentView === 'loading' && <div className="min-h-screen bg-white" />}
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
