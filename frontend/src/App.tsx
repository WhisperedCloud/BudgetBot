import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  LayoutDashboard, Wallet, PieChart, MessageSquare, 
  Settings, Bell, LogOut, Loader2, Sparkles, X, Eye, EyeOff, Mic, MicOff,
  Plus, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { fetchWithAuth } from './lib/api';
import MeshGradient from './components/MeshGradient';
import OverviewTab from './components/OverviewTab';
import TransactionsTab from './components/TransactionsTab';
import BudgetsTab from './components/BudgetsTab';
import AIAdvisorTab from './components/AIAdvisorTab';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{name: string, email: string} | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  const handleLogin = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <>
      <Toaster position="bottom-right" richColors />
      {!token ? <AuthScreen onLogin={handleLogin} /> : <Dashboard user={user} onLogout={handleLogout} />}
    </>
  );
}

function AuthScreen({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };
      
      const data = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-x-hidden">
      
      <div className={`flex flex-col md:h-screen w-full min-h-screen transition-all duration-700 ease-in-out ${isLogin ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        
        {/* Branding Panel */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className="w-full md:w-1/2 py-12 md:py-16 px-6 md:px-16 md:h-full relative flex flex-col justify-center items-center overflow-hidden z-0 bg-secondary/20"
        >
          <MeshGradient />
          <div className="z-10 text-center flex flex-col items-center mt-4 md:mt-0">
            <motion.div layoutId="logo-icon" className="w-24 h-24 md:w-36 md:h-36 rounded-3xl md:rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl mb-8 border border-primary/20 overflow-hidden">
              <img src="/Img1.png" alt="BudgetBot Logo" className="w-full h-full object-cover" />
            </motion.div>
            <motion.h1 layoutId="logo-text" className="text-4xl md:text-6xl font-bold text-[#0A1E3D] tracking-tight mb-3 md:mb-4 drop-shadow-sm">
              BudgetBot
            </motion.h1>
            <motion.p layoutId="logo-desc" className="text-sm md:text-lg text-muted-foreground font-light max-w-sm md:max-w-md mx-auto leading-relaxed hidden sm:block">
              {isLogin ? 'Your intelligent financial companion. Let AI optimize your wealth today.' : 'Join thousands of users who have automated their financial future with precision.'}
            </motion.p>
          </div>
        </motion.div>

        {/* Form Panel */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className="w-full md:w-1/2 flex-1 md:h-full bg-card flex flex-col justify-center items-center p-6 py-12 md:p-16 z-10 md:shadow-2xl relative"
        >
          <div className="w-full max-w-sm">
            <motion.div layoutId="form-header" className="mb-8 md:mb-10 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight mb-2">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-light">
                {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to start tracking your expenses.'}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm w-full font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.form 
                key={isLogin ? 'login-form' : 'register-form'}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit} 
                className="space-y-4 md:space-y-5 w-full"
              >
                {!isLogin && (
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-1.5 md:mb-2">Full Name</label>
                    <input 
                      type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 md:py-3.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-light text-sm md:text-base"
                      placeholder="Alex Student"
                    />
                  </motion.div>
                )}
                
                <motion.div variants={itemVariants}>
                  <label className="block text-xs md:text-sm font-medium text-foreground mb-1.5 md:mb-2">Email Address</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 md:py-3.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-light text-sm md:text-base"
                    placeholder="alex@example.com"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-xs md:text-sm font-medium text-foreground mb-1.5 md:mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-secondary/30 border border-border rounded-xl pl-4 pr-12 py-3 md:py-3.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-light text-sm md:text-base"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit" disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-medium py-3.5 md:py-4 rounded-xl hover:bg-primary/90 transition-all mt-4 flex justify-center items-center shadow-lg disabled:opacity-70 text-sm md:text-base"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            <motion.p layoutId="switch-text" className="text-center text-muted-foreground mt-8 md:mt-10 text-sm font-light">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-primary hover:text-primary/80 font-medium transition-colors">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ai' | 'manual' | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('financeTracker_notifications');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: 'Budget Alert', icon: '⚠️', desc: "You've reached 90% of your Monthly Food budget.", time: '2 HOURS AGO', read: false, colorClass: 'group-hover:text-destructive' },
      { id: 2, title: 'AI Insight', icon: '💡', desc: 'Based on your recent spending, you could save ₹500 by reducing dining out this week.', time: '5 HOURS AGO', read: false, colorClass: 'group-hover:text-primary' },
      { id: 3, title: 'Goal Reached', icon: '✅', desc: 'Congratulations! You met your monthly savings goal of ₹10,000.', time: '1 DAY AGO', read: false, colorClass: 'group-hover:text-green-600' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('financeTracker_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const { data: summary, isLoading } = useQuery({
    queryKey: ['expenseSummary'],
    queryFn: () => fetchWithAuth('/expenses/summary')
  });

  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard': return <OverviewTab key="dashboard" summary={summary} />;
      case 'transactions': return <TransactionsTab key="transactions" />;
      case 'budgets': return <BudgetsTab key="budgets" />;
      case 'advisor': return <AIAdvisorTab key="advisor" summary={summary} />;
      default: return <OverviewTab key="default" summary={summary} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative overflow-hidden">
      
      {/* Light Earthy Background Texture */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 border-r border-sidebar-border bg-sidebar flex flex-col z-50 shadow-sm transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 flex items-center px-8 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center mr-4 shadow-sm border border-sidebar-primary/20 overflow-hidden">
            <img src="/Img1.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground tracking-wide">
            BudgetBot
          </span>
        </div>
        
        <nav className="flex-1 px-5 py-8 space-y-2 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Wallet size={20} />} label="Transactions" active={activeTab === 'transactions'} onClick={() => { setActiveTab('transactions'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<PieChart size={20} />} label="Budgets" active={activeTab === 'budgets'} onClick={() => { setActiveTab('budgets'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<MessageSquare size={20} />} label="AI Advisor" active={activeTab === 'advisor'} onClick={() => { setActiveTab('advisor'); setIsMobileMenuOpen(false); }} />
        </nav>

        <div className="p-5 border-t border-sidebar-border space-y-2">
          <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} />
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sidebar-foreground opacity-70 hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen relative z-10 transition-all duration-300">
        <header className="h-20 md:h-24 border-b border-[#12284C] md:border-border flex items-center justify-between px-4 md:px-12 relative z-40 md:backdrop-blur-xl bg-[#0A1E3D] md:bg-background/80 transition-colors">
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#F7F6F2] opacity-80 hover:opacity-100 transition-opacity"
            >
              <Menu size={24} />
            </button>

          </div>
          <div className="flex items-center gap-4 md:gap-8 relative">
            <div className="relative">
              <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-destructive shadow-sm border border-card"></span>
                )}
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <NotificationDropdown 
                    isOpen={isNotificationsOpen} 
                    onClose={() => setIsNotificationsOpen(false)}
                    notifications={notifications}
                    onMarkAsRead={(id) => setNotifications((prev: any[]) => prev.map((n: any) => n.id === id ? { ...n, read: true } : n))}
                    onMarkAllAsRead={() => setNotifications((prev: any[]) => prev.map((n: any) => ({ ...n, read: true })))}
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 md:gap-4 sm:pl-8 sm:border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.name || 'Guest'}</p>
                <p className="text-xs text-primary font-medium tracking-wide">PREMIUM</p>
              </div>
              <div
                className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm"
              >
                {user?.name ? user.name[0].toUpperCase() : 'G'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-12 relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 md:mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2 md:mb-3 text-foreground">Welcome back, <span className="font-medium text-primary">{user?.name?.split(' ')[0] || 'Guest'}</span>.</h1>
              <p className="text-muted-foreground text-base md:text-lg font-light">Here is your financial briefing for today.</p>
            </div>
            {activeTab === 'dashboard' && (
              <div className="flex gap-4">
                <button 
                  onClick={() => setModalMode('manual')}
                  className="group relative flex items-center gap-3 bg-secondary/50 text-foreground border border-border px-7 py-3.5 rounded-full font-medium hover:bg-secondary transition-all active:scale-95 shadow-sm overflow-hidden"
                >
                  <Plus size={18} className="text-foreground relative z-10" />
                  <span className="relative z-10">Manual Entry</span>
                </button>
                
                <button 
                  onClick={() => setModalMode('ai')}
                  className="group relative flex items-center gap-3 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-md overflow-hidden"
                >
                  <Sparkles size={18} className="text-primary-foreground relative z-10" />
                  <span className="relative z-10">AI Voice Assistant</span>
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Dashboard Modal */}
      <AnimatePresence>
        {modalMode && <TransactionModal mode={modalMode} onClose={() => setModalMode(null)} />}
      </AnimatePresence>
    </div>
  );
}

function TransactionModal({ mode, onClose }: { mode: 'ai' | 'manual', onClose: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const queryClient = useQueryClient();

  // Manual Form State
  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Your browser does not support Voice Recognition.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => { setIsListening(true); setError(''); };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setText(transcript);
    };
    recognition.onerror = (event: any) => { setError('Error: ' + event.error); setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };

    if (isListening) recognition.stop();
    else recognition.start();
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await fetchWithAuth('/ai/parse-expense', { method: 'POST', body: JSON.stringify({ text }) });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      toast.success('Transaction parsed and saved!');
      onClose();
    } catch (err: any) { setError(err.message); toast.error(err.message); } finally { setLoading(false); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await fetchWithAuth('/expenses', {
        method: 'POST',
        body: JSON.stringify({ type, amount, category, description })
      });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      toast.success('Transaction saved!');
      onClose();
    } catch (err: any) { setError(err.message); toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/20 backdrop-blur-md flex items-center justify-center z-[100] p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="w-full max-w-xl"
      >
        <div className="w-full p-10 relative overflow-hidden bg-card rounded-[32px] shadow-2xl border border-border">
          <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors z-20"><X size={24} /></button>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/Img1.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-foreground tracking-tight">{mode === 'ai' ? 'AI Voice Assistant' : 'Manual Entry'}</h2>
              <p className="text-sm text-muted-foreground mt-1">{mode === 'ai' ? 'Speak or type your income/expenses' : 'Record your income or expense manually'}</p>
            </div>
          </div>

          {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6 text-sm relative z-10">{error}</div>}

          {mode === 'ai' ? (
            <form onSubmit={handleAISubmit} className="relative z-10">
              <div className="relative mb-6">
                <textarea required autoFocus value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-white border border-border rounded-2xl pl-6 pr-14 py-5 text-lg text-foreground focus:outline-none focus:border-primary transition-all resize-none h-32 font-light placeholder:text-muted-foreground shadow-inner" placeholder="e.g. I just got paid ₹10000 or I spent ₹450 on food..." />
                <button type="button" onClick={handleSpeech} className={`absolute right-4 bottom-4 p-3 rounded-xl transition-all shadow-md ${isListening ? 'bg-destructive/10 text-destructive animate-pulse border-destructive/30' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'}`}>
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
              <button type="submit" disabled={loading || !text.trim()} className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center gap-3 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={18} className="text-primary-foreground" /> Parse & Record</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="relative z-10 space-y-4">
              <div className="flex gap-4">
                <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 py-3 rounded-xl border transition-all ${type === 'EXPENSE' ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-secondary/20 border-border text-muted-foreground'}`}>Expense</button>
                <button type="button" onClick={() => setType('INCOME')} className={`flex-1 py-3 rounded-xl border transition-all ${type === 'INCOME' ? 'bg-green-500/10 border-green-500/30 text-green-700' : 'bg-secondary/20 border-border text-muted-foreground'}`}>Income</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary shadow-sm" />
                <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Food)" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary shadow-sm" />
              </div>
              <input required type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary shadow-sm" />
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center gap-3 disabled:opacity-50 mt-2 shadow-md">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Transaction'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-[#C8A46B]/15 text-[#C8A46B] border border-[#C8A46B]/30 shadow-sm font-semibold' 
          : 'text-sidebar-foreground opacity-70 hover:opacity-100 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      }`}
    >
      <div className={`${active ? 'text-[#C8A46B]' : ''}`}>
        {icon}
      </div>
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </button>
  );
}

function NotificationDropdown({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }: { isOpen: boolean, onClose: () => void, notifications: any[], onMarkAsRead: (id: number) => void, onMarkAllAsRead: () => void }) {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-12 right-0 w-80 bg-card text-card-foreground border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/10">
        <h3 className="font-semibold tracking-tight text-foreground">Notifications</h3>
        <div className="flex items-center gap-3">
          {notifications.some(n => !n.read) && (
            <button onClick={onMarkAllAsRead} className="text-xs text-primary hover:underline font-medium">Mark all as read</button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18}/></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map(n => (
          <div key={n.id} onClick={() => onMarkAsRead(n.id)} className={`p-4 border-b border-border hover:bg-secondary/20 transition-colors cursor-pointer group relative ${n.read ? 'opacity-60' : ''}`}>
            {!n.read && <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-sm"></span>}
            <p className={`text-sm font-medium text-foreground ${n.colorClass} flex items-center gap-2 transition-colors`}>{n.icon} {n.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.desc}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-2 font-medium">{n.time}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default App;
