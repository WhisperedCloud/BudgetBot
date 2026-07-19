import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut, Loader2, X } from 'lucide-react';
import { notify } from '../lib/notifications';
import GlareHover from './GlareHover';
import { fetchWithAuth } from '../lib/api';

export default function SettingsTab({ user, onLogout, onUpdateUser }: { user: any, onLogout: () => void, onUpdateUser: (u: any) => void }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [budgetAlerts, setBudgetAlerts] = useState(user?.budgetAlerts ?? true);
  const [weeklyReport, setWeeklyReport] = useState(user?.weeklyReport ?? false);
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Form state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError('');

    try {
      const response = await fetchWithAuth('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          profileImage,
          budgetAlerts,
          weeklyReport,
          currency
        })
      });

      onUpdateUser(response.user);
      setSaved(true);
      notify.success('Settings', 'Settings saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
      notify.error('Settings', err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await fetchWithAuth('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
      notify.success('Security', 'Password updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
      notify.error('Security', err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('/auth/2fa/generate', { method: 'POST' });
      setQrCodeUrl(res.qrCodeUrl);
      setShow2FAModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate 2FA setup');
      notify.error('Security', err.message || 'Failed to generate 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetchWithAuth('/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ code: twoFactorCode })
      });
      setShow2FAModal(false);
      setTwoFactorCode('');
      onUpdateUser({ ...user, isTwoFactorEnabled: true });
      setSaved(true);
      notify.success('Security', '2FA enabled successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Invalid 2FA code');
      notify.error('Security', err.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
    setLoading(true);
    try {
      await fetchWithAuth('/auth/2fa/disable', { method: 'POST' });
      onUpdateUser({ ...user, isTwoFactorEnabled: false });
      setSaved(true);
      notify.success('Security', '2FA disabled successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
      notify.error('Security', err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8"
    >
      <div className="w-full md:w-64 space-y-2">
        <button 
          onClick={() => setActiveSection('profile')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'profile' ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <User size={18} /> Profile Details
        </button>
        <button 
          onClick={() => setActiveSection('preferences')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'preferences' ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <Bell size={18} /> Preferences
        </button>
        <button 
          onClick={() => setActiveSection('security')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'security' ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <Shield size={18} /> Security
        </button>
        
        <div className="pt-6 mt-6 border-t border-border">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-medium"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1">
        <GlareHover
          glareOpacity={0.05}
          background="#0A1E3D"
          borderColor="#12284C"
          className="p-8 rounded-2xl shadow-sm bg-card relative z-10"
        >
          {activeSection === 'profile' && (
            <div className="relative z-10 w-full">
              <h2 className="text-2xl font-light text-foreground tracking-tight mb-6">Profile Settings</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-medium shadow-md overflow-hidden relative">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      name ? name[0].toUpperCase() : 'G'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Profile Picture</p>
                    <p className="text-xs text-muted-foreground mb-3 mt-1">PNG, JPG up to 5MB</p>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-medium bg-secondary text-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors border border-border">
                        Upload New
                      </button>
                      {profileImage && (
                        <button type="button" onClick={() => setProfileImage('')} className="text-xs font-medium bg-destructive/10 text-destructive px-4 py-2 rounded-lg hover:bg-destructive/20 transition-colors border border-destructive/20">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full bg-secondary/20 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full bg-secondary/20 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all opacity-70"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border flex items-center gap-4">
                  <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                  {saved && <span className="text-sm text-green-500 font-medium">Saved successfully!</span>}
                  {error && <span className="text-sm text-destructive font-medium">{error}</span>}
                </div>
              </form>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="relative z-10 w-full">
              <h2 className="text-2xl font-light text-foreground tracking-tight mb-6">Preferences</h2>
              <form onSubmit={handleSave} className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-secondary/10 border border-border rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                      <div>
                        <p className="font-medium text-foreground text-sm">Budget Alerts</p>
                        <p className="text-xs text-muted-foreground mt-1">Get notified when you approach your budget limits</p>
                      </div>
                      <input type="checkbox" checked={budgetAlerts} onChange={() => setBudgetAlerts(!budgetAlerts)} className="w-5 h-5 accent-primary rounded cursor-pointer" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-secondary/10 border border-border rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                      <div>
                        <p className="font-medium text-foreground text-sm">Weekly Financial Report</p>
                        <p className="text-xs text-muted-foreground mt-1">Receive a weekly summary of your expenses</p>
                      </div>
                      <input type="checkbox" checked={weeklyReport} onChange={() => setWeeklyReport(!weeklyReport)} className="w-5 h-5 accent-primary rounded cursor-pointer" />
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Regional</h3>
                  <div className="max-w-xs">
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Primary Currency</label>
                    <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)} 
                      className="w-full bg-secondary/20 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="INR">₹ INR - Indian Rupee</option>
                      <option value="USD">$ USD - US Dollar</option>
                      <option value="EUR">€ EUR - Euro</option>
                      <option value="GBP">£ GBP - British Pound</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border flex items-center gap-4">
                  <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Save Preferences
                  </button>
                  {saved && <span className="text-sm text-green-500 font-medium">Saved successfully!</span>}
                  {error && <span className="text-sm text-destructive font-medium">{error}</span>}
                </div>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="relative z-10 w-full">
              <h2 className="text-2xl font-light text-foreground tracking-tight mb-6">Security</h2>
              
              {saved && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm">Action completed successfully!</div>}
              {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">{error}</div>}
              
              <div className="space-y-6">
                <div className="p-4 bg-secondary/10 border border-border rounded-xl">
                  <h3 className="font-medium text-foreground mb-1">Change Password</h3>
                  <p className="text-xs text-muted-foreground mb-4">Update your password to keep your account secure.</p>
                  <button onClick={() => setShowPasswordModal(true)} className="text-sm font-medium bg-secondary text-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors border border-border">
                    Update Password
                  </button>
                </div>
                
                <div className="p-4 bg-secondary/10 border border-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Two-Factor Authentication</h3>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                  {user?.isTwoFactorEnabled ? (
                    <button onClick={handleDisable2FA} disabled={loading} className="text-sm font-medium bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors w-fit">
                      {loading ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
                      Disable 2FA
                    </button>
                  ) : (
                    <button onClick={handleGenerate2FA} disabled={loading} className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-fit">
                      {loading ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
                      Enable 2FA
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </GlareHover>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-xl relative"
          >
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
            <h3 className="text-xl font-medium text-foreground mb-4">Update Password</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-secondary/20 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-secondary/20 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-secondary/20 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 mt-2">
                {loading && <Loader2 size={16} className="animate-spin" />} Update Password
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-xl relative"
          >
            <button onClick={() => setShow2FAModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
            <h3 className="text-xl font-medium text-foreground mb-4">Set Up 2FA</h3>
            <p className="text-sm text-muted-foreground mb-6">Scan the QR code below with your authenticator app (like Google Authenticator), then enter the 6-digit code.</p>
            
            <div className="flex justify-center mb-6 bg-white p-4 rounded-xl w-fit mx-auto">
              {qrCodeUrl ? <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" /> : <Loader2 className="animate-spin text-primary m-12" size={32} />}
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">6-Digit Code</label>
                <input type="text" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} placeholder="000000" maxLength={6} required className="w-full bg-secondary/20 border border-border rounded-xl px-4 py-3 text-foreground text-center tracking-widest text-xl focus:outline-none focus:border-primary" />
              </div>
              <button type="submit" disabled={loading || twoFactorCode.length !== 6} className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader2 size={16} className="animate-spin" />} Verify & Enable
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
