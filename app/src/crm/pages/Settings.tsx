import { useEffect, useRef, useState } from 'react';
import { Building2, User, Bell, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

type CompanySettings = {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  logoUrl: string;
};

type ProfileSettings = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type NotificationSettings = {
  newLeadAssigned: boolean;
  taskDueSoon: boolean;
  invoicePaid: boolean;
  projectUpdates: boolean;
};

type SecuritySettings = {
  twoFactorEnabled: boolean;
};

export function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanySettings>({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: '',
    taxId: '',
    logoUrl: '/images/amt-logo.png',
  });
  const [profile, setProfile] = useState<ProfileSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newLeadAssigned: true,
    taskDueSoon: true,
    invoicePaid: true,
    projectUpdates: true,
  });
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [twoFaEmail, setTwoFaEmail] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const authHeaders: Record<string, string> = {};
        if (token) authHeaders.Authorization = `Bearer ${token}`;
        const [companyRes, profileRes, notifRes, securityRes] = await Promise.all([
          fetch(`${API_BASE}/api/settings/company`),
          fetch(`${API_BASE}/api/settings/profile`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/settings/notifications`),
          fetch(`${API_BASE}/api/settings/security`, { headers: authHeaders }),
        ]);

        if (companyRes.ok) {
          const c = await companyRes.json();
          setCompany({
            companyName: c.companyName ?? '',
            email: c.email ?? '',
            phone: c.phone ?? '',
            website: c.website ?? '',
            address: c.address ?? '',
            city: c.city ?? '',
            country: c.country ?? '',
            taxId: c.taxId ?? '',
            logoUrl: c.logoUrl ?? '/images/amt-logo.png',
          });
        }

        if (profileRes.ok) {
          const p = await profileRes.json();
          setProfile({
            firstName: p.firstName ?? '',
            lastName: p.lastName ?? '',
            email: p.email ?? '',
            phone: p.phone ?? '',
          });
        }

        if (notifRes.ok) {
          const n = await notifRes.json();
          setNotifications({
            newLeadAssigned: Boolean(n.newLeadAssigned),
            taskDueSoon: Boolean(n.taskDueSoon),
            invoicePaid: Boolean(n.invoicePaid),
            projectUpdates: Boolean(n.projectUpdates),
          });
        }

        if (securityRes.ok) {
          const s = await securityRes.json();
          const enabled = s.twoFactorEnabled ?? s.TwoFactorEnabled;
          setSecurity({
            twoFactorEnabled: Boolean(enabled),
          });
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChangePassword = async () => {
    if (!profile.email) {
      toast.error('Profile email is required to change password.');
      return;
    }
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          currentPassword: passwords.current,
          newPassword: passwords.next,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = text || 'Failed to update password.';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      setPasswords({ current: '', next: '', confirm: '' });
      toast.success('Password updated successfully.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update password.');
    }
  };

  const handleSendTwoFactorCode = async () => {
    const identityEmail = localStorage.getItem('authEmail') || profile.email;
    const targetEmail = twoFaEmail || identityEmail;
    if (!identityEmail) {
      toast.error('Profile email is required to send 2FA codes.');
      return;
    }
    setIsSendingCode(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 70000);
    try {
      toast.info('Server is waking up, this may take up to 1-2 minutes on free tiers.');
      const res = await fetch(`${API_BASE}/api/auth/2fa/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identityEmail,
          targetEmail,
        }),
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = text || 'Failed to send verification code.';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      toast.success('Verification code sent to your email (or check API console in dev).');
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        toast.error('Sending timed out. Please try again in a minute.');
        return;
      }
      toast.error(e instanceof Error ? e.message : 'Failed to send verification code.');
    } finally {
      window.clearTimeout(timeoutId);
      setIsSendingCode(false);
    }
  };

  const handleVerifyTwoFactorCode = async () => {
    if (!profile.email) {
      toast.error('Profile email is required.');
      return;
    }
    if (!twoFaCode) {
      toast.error('Please enter the verification code.');
      return;
    }
    setIsVerifyingCode(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/2fa/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          code: twoFaCode,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = text || 'Failed to verify code.';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      setSecurity((prev) => ({ ...prev, twoFactorEnabled: true }));
      setTwoFaCode('');
      toast.success('Two-factor authentication enabled.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to verify code.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!profile.email) {
      toast.error('Profile email is required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email }),
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = text || 'Failed to disable 2FA.';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      setSecurity((prev) => ({ ...prev, twoFactorEnabled: false }));
      toast.success('Two-factor authentication disabled.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to disable 2FA.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const profileHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) profileHeaders.Authorization = `Bearer ${token}`;

      const responses = await Promise.all([
        fetch(`${API_BASE}/api/settings/company`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: company.companyName,
            email: company.email,
            phone: company.phone,
            website: company.website,
            address: company.address,
            city: company.city,
            country: company.country,
            taxId: company.taxId,
            logoUrl: company.logoUrl || '/images/amt-logo.png',
          }),
        }),
        fetch(`${API_BASE}/api/settings/profile`, {
          method: 'PUT',
          headers: profileHeaders,
          body: JSON.stringify({
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
          }),
        }),
        fetch(`${API_BASE}/api/settings/notifications`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newLeadAssigned: notifications.newLeadAssigned,
            taskDueSoon: notifications.taskDueSoon,
            invoicePaid: notifications.invoicePaid,
            projectUpdates: notifications.projectUpdates,
          }),
        }),
        fetch(`${API_BASE}/api/settings/security`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            twoFactorEnabled: security.twoFactorEnabled,
          }),
        }),
      ]);

      const firstError = responses.find((r) => !r.ok);
      if (firstError) {
        const text = await firstError.text();
        let msg = text || 'Failed to save settings.';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // keep msg
        }
        throw new Error(msg);
      }

      toast.success('Settings saved successfully!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-[var(--amd-gray-500)]">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-[var(--amd-black)]">
            Settings
          </h1>
          <p className="text-[var(--amd-gray-500)] mt-1">Manage your account and system preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">Company Name</label>
                    <Input
                      className="mt-1"
                      value={company.companyName}
                      onChange={(e) => setCompany((prev) => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">Email</label>
                    <Input
                      className="mt-1"
                      value={company.email}
                      onChange={(e) => setCompany((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">Phone</label>
                    <Input
                      className="mt-1"
                      value={company.phone}
                      onChange={(e) => setCompany((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">Website</label>
                    <Input
                      className="mt-1"
                      value={company.website}
                      onChange={(e) => setCompany((prev) => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Address</label>
                  <Input
                    className="mt-1"
                    value={company.address}
                    onChange={(e) => setCompany((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">City</label>
                    <Input
                      className="mt-1"
                      value={company.city}
                      onChange={(e) => setCompany((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">Country</label>
                    <Input
                      className="mt-1"
                      value={company.country}
                      onChange={(e) => setCompany((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">Tax ID</label>
                    <Input
                      className="mt-1"
                      value={company.taxId}
                      onChange={(e) => setCompany((prev) => ({ ...prev, taxId: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Company Logo</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-[var(--amd-gray-100)] flex items-center justify-center">
                      <img
                        src={company.logoUrl || '/images/amt-logo.png'}
                        alt="Logo"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                      >
                        Change Logo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = reader.result;
                            if (typeof result === 'string') {
                              setCompany((prev) => ({ ...prev, logoUrl: result }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <p className="text-xs text-[var(--amd-gray-500)]">
                        Choose an image from your computer (stored as embedded data).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">First Name</label>
                    <Input
                      className="mt-1"
                      value={profile.firstName}
                      onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--amd-gray-700)]">Last Name</label>
                    <Input
                      className="mt-1"
                      value={profile.lastName}
                      onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Email</label>
                  <Input
                    className="mt-1"
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Phone</label>
                  <Input
                    className="mt-1"
                    value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[var(--amd-gray-100)]">
                  <div>
                    <p className="font-medium">New lead assigned</p>
                    <p className="text-sm text-[var(--amd-gray-500)]">
                      Get notified when a new lead is assigned to you
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newLeadAssigned}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, newLeadAssigned: Boolean(checked) }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[var(--amd-gray-100)]">
                  <div>
                    <p className="font-medium">Task due soon</p>
                    <p className="text-sm text-[var(--amd-gray-500)]">
                      Get reminded about tasks due within 24 hours
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskDueSoon}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, taskDueSoon: Boolean(checked) }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[var(--amd-gray-100)]">
                  <div>
                    <p className="font-medium">Invoice paid</p>
                    <p className="text-sm text-[var(--amd-gray-500)]">
                      Get notified when an invoice is paid
                    </p>
                  </div>
                  <Switch
                    checked={notifications.invoicePaid}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, invoicePaid: Boolean(checked) }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Project updates</p>
                    <p className="text-sm text-[var(--amd-gray-500)]">
                      Get notified about project status changes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.projectUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, projectUpdates: Boolean(checked) }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Current Password</label>
                  <Input
                    type="password"
                    className="mt-1"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, current: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">New Password</label>
                  <Input
                    type="password"
                    className="mt-1"
                    value={passwords.next}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, next: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Confirm New Password</label>
                  <Input
                    type="password"
                    className="mt-1"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
                    }
                  />
                </div>
                <Button
                  className="bg-[var(--amd-black)] text-white"
                  type="button"
                  onClick={handleChangePassword}
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card data-2fa-card className="border-[var(--amd-gray-200)]">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--amd-gray-600)]" />
                  Two-Factor Authentication
                </CardTitle>
                <p className="text-sm text-[var(--amd-gray-500)] mt-1">
                  Require a verification code by email when signing in.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-[var(--amd-gray-200)] p-4 bg-[var(--amd-gray-50)]/50">
                  <div>
                    <p className="font-medium text-[var(--amd-gray-900)]">Enable 2FA</p>
                    <p className="text-sm text-[var(--amd-gray-500)]">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      if (!checked) handleDisableTwoFactor();
                    }}
                  />
                </div>
                {!security.twoFactorEnabled && (
                  <div className="space-y-4 rounded-lg border border-[var(--amd-gray-200)] p-4 bg-white">
                    <p className="text-sm font-medium text-[var(--amd-gray-700)]">Set up 2FA</p>
                    <div>
                      <label className="text-sm font-medium text-[var(--amd-gray-700)]">
                        Email for verification codes
                      </label>
                      <Input
                        className="mt-1"
                        placeholder={profile.email || 'you@example.com'}
                        value={twoFaEmail}
                        onChange={(e) => setTwoFaEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendTwoFactorCode}
                      disabled={isSendingCode}
                    >
                      {isSendingCode ? 'Sending…' : 'Send Verification Code'}
                    </Button>
                    <div>
                      <label className="text-sm font-medium text-[var(--amd-gray-700)]">
                        Enter verification code
                      </label>
                      <Input
                        className="mt-1"
                        placeholder="000000"
                        value={twoFaCode}
                        onChange={(e) => setTwoFaCode(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyTwoFactorCode}
                      disabled={isVerifyingCode}
                      className="bg-[var(--amd-black)] text-white"
                    >
                      {isVerifyingCode ? 'Verifying…' : 'Verify & Enable 2FA'}
                    </Button>
                    <p className="text-xs text-[var(--amd-gray-500)]">
                      Code is sent to the email above, or your profile email if left blank.
                    </p>
                  </div>
                )}
                {security.twoFactorEnabled && (
                  <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                    <p className="text-sm font-medium text-green-800">
                      Two-factor authentication is enabled for this account.
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      You will be asked for a code when signing in.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
