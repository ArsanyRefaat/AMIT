import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

type AppView = 'entry' | 'website' | 'crm' | 'login';

interface LoginPageProps {
  onNavigate: (view: AppView) => void;
  onLogin: (auth: { token: string; roles: string[]; email: string; userId: string }) => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [twoFaStep, setTwoFaStep] = useState(false);
  const [twoFaEmail, setTwoFaEmail] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = text || 'Login failed.';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // keep msg
        }
        toast.error(msg);
        return;
      }

      const data = JSON.parse(text) as {
        token?: string;
        roles?: string[];
        email?: string;
        userId?: string;
        requiresTwoFactor?: boolean;
        RequiresTwoFactor?: boolean;
        Email?: string;
      };

      // If server says 2FA required, show code step and do NOT use token
      const requires2FA = data.requiresTwoFactor === true || data.RequiresTwoFactor === true;
      const responseEmail = (data.email ?? data.Email ?? '').trim();

      if (requires2FA) {
        setTwoFaEmail(responseEmail || email);
        setTwoFaStep(true);
        setTwoFaCode('');
        toast.success(responseEmail ? 'Check your email for the verification code.' : 'Enter your verification code.');
        return;
      }

      if (!data.token) {
        toast.error('Login failed: invalid response from server.');
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authEmail', data.email ?? email);
      localStorage.setItem('authUserId', data.userId ?? '');
      localStorage.setItem('authRoles', JSON.stringify(data.roles ?? []));

      onLogin({
        token: data.token,
        roles: data.roles ?? [],
        email: data.email ?? email,
        userId: data.userId ?? '',
      });
      toast.success('Logged in successfully.');
      onNavigate('crm');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to login. Please check if the backend is running on http://localhost:5141.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaEmail || !twoFaCode.trim()) {
      toast.error('Please enter the verification code.');
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/2fa/complete-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: twoFaEmail, code: twoFaCode.trim() }),
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = text || 'Verification failed.';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // keep msg
        }
        toast.error(msg);
        return;
      }
      const data = JSON.parse(text) as { token: string; roles: string[]; email: string; userId: string };
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authEmail', data.email);
      localStorage.setItem('authUserId', data.userId);
      localStorage.setItem('authRoles', JSON.stringify(data.roles ?? []));
      onLogin(data);
      toast.success('Logged in successfully.');
      onNavigate('crm');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!twoFaEmail) return;
    setIsResending(true);
    toast.info('Server is waking up, this may take up to 1-2 minutes.');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 70000);
    try {
      const res = await fetch(`${API_BASE}/api/auth/2fa/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: twoFaEmail, targetEmail: twoFaEmail }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error((j as { error?: string })?.error ?? 'Failed to resend code.');
        return;
      }
      toast.success('A new code was sent to your email.');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.error('Sending code timed out. Please try again.');
        return;
      }
      toast.error('Failed to resend code.');
    } finally {
      window.clearTimeout(timeoutId);
      setIsResending(false);
    }
  };

  if (twoFaStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A962]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C9A962]/3 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <img src="/images/amt-logo.png" alt="AMT Solutions" className="h-14 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-white mb-1">Two-factor verification</h1>
            <p className="text-sm text-[#A3A3A3]">
              We sent a code to <span className="text-[#E5E5E5]">{twoFaEmail}</span>
            </p>
          </motion.div>
          <motion.form
            onSubmit={handleVerifyCode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111]/90 border border-[#333] rounded-2xl p-6 space-y-4 shadow-xl"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E5E5E5]">Verification code</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="pl-9 bg-black/40 border-[#333] text-white placeholder:text-[#555] text-center tracking-widest"
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-white text-black hover:bg-[#F3F3F3] font-medium"
            >
              {isVerifying ? 'Verifying…' : 'Verify and sign in'}
            </Button>
            <button
              type="button"
              disabled={isResending}
              className="w-full text-sm text-[#C9A962] hover:underline"
              onClick={handleResendCode}
            >
              {isResending ? 'Sending…' : 'Resend code'}
            </button>
            <button
              type="button"
              className="w-full text-xs text-[#999] underline mt-2"
              onClick={() => setTwoFaStep(false)}
            >
              Back to sign in
            </button>
          </motion.form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A962]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C9A962]/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <img src="/images/amt-logo.png" alt="AMT Solutions" className="h-14 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white mb-1">Sign in to CRM</h1>
          <p className="text-sm text-[#A3A3A3]">Enter your credentials to continue.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#111]/90 border border-[#333] rounded-2xl p-6 space-y-4 shadow-xl"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#E5E5E5]">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                className="pl-9 bg-black/40 border-[#333] text-white placeholder:text-[#555]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#E5E5E5]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                className="pl-9 bg-black/40 border-[#333] text-white placeholder:text-[#555]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-[#F3F3F3] font-medium mt-2"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>

          <button
            type="button"
            className="w-full text-xs text-[#999] underline mt-2"
            onClick={() => onNavigate('entry')}
          >
            Back to start page
          </button>
        </motion.form>
      </div>
    </div>
  );
}

