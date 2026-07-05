import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertCircle, Plus, X, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/api';
import GlareHover from './GlareHover';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export default function BudgetsTab({ searchQuery = '' }: { searchQuery?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: () => fetchWithAuth('/budgets')
  });

  const filteredBudgets = budgets?.filter((budget: any) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return budget.category.toLowerCase().includes(lowerQuery);
  }) || [];

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
      await fetchWithAuth('/ai/parse-budget', { method: 'POST', body: JSON.stringify({ text }) });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsModalOpen(false);
      setText('');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await fetchWithAuth('/budgets', {
        method: 'POST',
        body: JSON.stringify({ category, amount: parseFloat(amount) })
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsModalOpen(false);
      setCategory('');
      setAmount('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={32} /></div>;
  }

  // Pre-defined elegant colors to assign to budgets
  const colors = [
    'from-primary/80 to-primary',
    'from-accent/80 to-accent',
    'from-destructive/80 to-destructive',
    'from-[#4B5563]/80 to-[#4B5563]',
    'from-[#1F2937]/80 to-[#1F2937]'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full space-y-6 relative"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-foreground font-medium">Monthly Budgets</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-all text-sm font-medium border border-primary/20"
        >
          <Plus size={16} /> Add Budget Limit
        </button>
      </div>

      {filteredBudgets.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
          <Target size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg text-foreground font-medium">No budgets set</h3>
          <p className="text-muted-foreground mt-1 text-sm">Add a budget to start tracking your category limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget: any, i: number) => {
            const percent = Math.min((budget.spent / budget.limit) * 100, 100);
            const isNearLimit = percent >= 80;
            const color = colors[i % colors.length];

            return (
              <motion.div
                key={budget.category}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlareHover
                  glareOpacity={0.1}
                  background="#FFFFFF"
                  borderColor="#BBBDBC"
                  className="p-6 rounded-2xl shadow-sm"
                >
                  <div className="w-full flex flex-col justify-between h-full relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Target size={16} className="text-muted-foreground" />
                          <h3 className="font-medium text-foreground">{budget.category}</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-light text-foreground">₹{budget.spent.toFixed(0)}</span>
                          <span className="text-sm text-muted-foreground">/ ₹{budget.limit}</span>
                        </div>
                      </div>
                      {isNearLimit && (
                        <div className="px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1">
                          <AlertCircle size={12} />
                          Near Limit
                        </div>
                      )}
                    </div>

                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${color}`}
                      />
                    </div>
                  </div>
                </GlareHover>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="w-full max-w-md"
            >
              <div className="p-8 relative overflow-hidden bg-card rounded-[32px] shadow-2xl border border-border">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors z-20"><X size={20} /></button>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm overflow-hidden">
                    <img src="/Img1.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-foreground">{mode === 'ai' ? 'AI Budget Assistant' : 'Set Budget Limit'}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{mode === 'ai' ? 'Speak or type your budget limit' : 'Set a limit manually'}</p>
                  </div>
                </div>

                <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl mb-6 relative z-10 border border-border">
                  <button onClick={() => setMode('ai')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'ai' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Voice AI</button>
                  <button onClick={() => setMode('manual')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Manual Entry</button>
                </div>

                {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl mb-4 text-sm relative z-10">{error}</div>}

                {mode === 'ai' ? (
                  <form onSubmit={handleAISubmit} className="relative z-10">
                    <div className="relative mb-4">
                      <textarea required autoFocus value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-white border border-border rounded-xl pl-4 pr-12 py-3 text-foreground focus:outline-none focus:border-primary transition-all resize-none h-24 font-light placeholder:text-muted-foreground text-sm shadow-inner" placeholder="e.g. Set my food budget to ₹5000..." />
                      <button type="button" onClick={handleSpeech} className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all shadow-md ${isListening ? 'bg-destructive/10 text-destructive animate-pulse border-destructive/30' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'}`}>
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>
                    </div>
                    <button type="submit" disabled={loading || !text.trim()} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={16} className="text-primary-foreground" /> Set Budget Limit</>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleManualSubmit} className="relative z-10 space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Category Name</label>
                      <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Food" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary shadow-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Monthly Limit (₹)</label>
                      <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5000" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary shadow-sm" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90 transition-all mt-2 flex justify-center items-center">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Budget'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
