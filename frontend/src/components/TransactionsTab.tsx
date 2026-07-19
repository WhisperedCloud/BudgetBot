import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Search, Filter, Calendar, Loader2, ChevronDown, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/api';
import GlareHover from './GlareHover';

export default function TransactionsTab({ searchQuery = '' }: { searchQuery?: string }) {
  const [localSearch, setLocalSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  
  const { data: summary, isLoading } = useQuery({
    queryKey: ['expenseSummary'],
    queryFn: () => fetchWithAuth('/expenses/summary'),
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    refetchOnWindowFocus: false,
  });

  const categories = summary?.recentExpenses ? Array.from(new Set(summary.recentExpenses.map((e: any) => e.category))) as string[] : [];

  const activeSearch = localSearch || searchQuery;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search transactions..." 
            className="w-full bg-white border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-sm transition-all"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-full px-5 border rounded-xl flex items-center gap-2 transition-colors shadow-sm ${isFilterOpen || filterType !== 'ALL' || filterCategory !== 'ALL' ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
          >
            <Filter size={18} />
            <span className="text-sm font-medium">Filters</span>
            {(filterType !== 'ALL' || filterCategory !== 'ALL') && (
              <span className="w-2 h-2 rounded-full bg-white ml-1"></span>
            )}
          </button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-14 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-border bg-secondary/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-foreground tracking-tight">Filter Transactions</h3>
                    <button 
                      onClick={() => { setFilterType('ALL'); setFilterCategory('ALL'); }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Type</p>
                      <div className="flex gap-2">
                        {['ALL', 'INCOME', 'EXPENSE'].map(type => (
                          <button 
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filterType === type ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary/20 border-border text-foreground hover:bg-secondary/40'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {categories.length > 0 && (
                      <div className="relative">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Category</p>
                        <button 
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className="w-full bg-secondary/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground flex justify-between items-center transition-colors hover:bg-secondary/30"
                        >
                          <span className="truncate">{filterCategory === 'ALL' ? 'All Categories' : filterCategory}</span>
                          <ChevronDown size={14} className={`transition-transform shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isCategoryDropdownOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 bg-secondary/10 border border-border rounded-lg max-h-40 overflow-y-auto py-1 flex flex-col custom-scrollbar">
                                <button
                                  onClick={() => { setFilterCategory('ALL'); setIsCategoryDropdownOpen(false); }}
                                  className={`text-left px-3 py-2 text-sm hover:bg-secondary/40 transition-colors flex items-center justify-between ${filterCategory === 'ALL' ? 'text-primary font-medium' : 'text-foreground'}`}
                                >
                                  <span>All Categories</span>
                                  {filterCategory === 'ALL' && <Check size={14} className="text-primary" />}
                                </button>
                                {categories.map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => { setFilterCategory(cat); setIsCategoryDropdownOpen(false); }}
                                    className={`text-left px-3 py-2 text-sm hover:bg-secondary/40 transition-colors flex items-center justify-between ${filterCategory === cat ? 'text-primary font-medium' : 'text-foreground'}`}
                                  >
                                    <span className="truncate pr-2">{cat}</span>
                                    {filterCategory === cat && <Check size={14} className="text-primary shrink-0" />}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <GlareHover
        glareOpacity={0.1}
        background="#FFFFFF"
        borderColor="#BBBDBC"
        className="rounded-2xl shadow-sm"
      >
        <div className="w-full p-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
          ) : summary?.recentExpenses?.filter((exp: any) => {
              let match = true;
              if (activeSearch) {
                const lowerQuery = activeSearch.toLowerCase();
                match = exp.description.toLowerCase().includes(lowerQuery) || 
                       exp.category.toLowerCase().includes(lowerQuery);
              }
              if (match && filterType !== 'ALL') {
                match = exp.type === filterType;
              }
              if (match && filterCategory !== 'ALL') {
                match = exp.category === filterCategory;
              }
              return match;
            }).length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {summary.recentExpenses.filter((exp: any) => {
              let match = true;
              if (activeSearch) {
                const lowerQuery = activeSearch.toLowerCase();
                match = exp.description.toLowerCase().includes(lowerQuery) || 
                       exp.category.toLowerCase().includes(lowerQuery);
              }
              if (match && filterType !== 'ALL') {
                match = exp.type === filterType;
              }
              if (match && filterCategory !== 'ALL') {
                match = exp.category === filterCategory;
              }
              return match;
            }).map((exp: any) => (
                <motion.div 
                  key={exp.id} 
                  variants={itemVariants}
                  className="flex items-center justify-between p-5 rounded-xl bg-card hover:bg-secondary border border-border transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                      <Wallet size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-lg text-foreground group-hover:text-primary transition-colors">{exp.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-secondary/30 border border-border">{exp.category}</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(exp.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className={`font-light text-2xl text-foreground transition-colors ${exp.type === 'INCOME' ? 'group-hover:text-green-600' : 'group-hover:text-destructive'}`}>
                    {exp.type === 'INCOME' ? '+' : '-'}₹{exp.amount}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <Wallet size={48} className="mb-4 opacity-30 stroke-1" />
              <p className="text-lg">No transactions yet</p>
              <p className="text-sm mt-2 opacity-50">Log your first transaction with AI</p>
            </div>
          )}
        </div>
      </GlareHover>
    </motion.div>
  );
}
