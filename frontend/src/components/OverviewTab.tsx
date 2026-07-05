import { Wallet, TrendingUp, Activity, LayoutDashboard, BrainCircuit, Sparkles, ArrowDownRight, Loader2 } from 'lucide-react';
import MagicBento from './MagicBento';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/api';
import ExpenseChart from './ExpenseChart';
import ExpenseBarChart from './ExpenseBarChart';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

export default function OverviewTab({ summary, searchQuery = '' }: { summary: any, searchQuery?: string }) {
  const { data: insights, isLoading: isInsightsLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => fetchWithAuth('/ai/insights'),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });

  const filteredExpenses = summary?.recentExpenses?.filter((exp: any) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return exp.description.toLowerCase().includes(lowerQuery) || 
           exp.category.toLowerCase().includes(lowerQuery);
  }) || [];

  const getBentoCards = () => {
    return [
      {
        color: '#FFFFFF',
        content: (
          <div className="h-full flex flex-col justify-between p-2">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Wallet size={20} /></div>
              <span className="font-medium">Total Balance</span>
            </div>
            <div>
              <h2 className="text-4xl font-light tracking-tight text-foreground mb-2">₹{summary?.totalBalance || 0}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Not calculated</span>
              </div>
            </div>
          </div>
        )
      },
      {
        color: '#FFFFFF',
        content: (
          <div className="h-full flex flex-col justify-between p-2">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <div className="p-2 bg-destructive/10 rounded-lg text-destructive"><TrendingUp size={20} className="rotate-180" /></div>
              <span className="font-medium">Total Expenses</span>
            </div>
            <div>
              <h2 className="text-4xl font-light tracking-tight text-foreground mb-2">₹{summary?.totalExpenses?.toLocaleString() || 0}</h2>
              <div className="flex items-center gap-1 text-sm text-destructive">
                <ArrowDownRight size={16} />
                <span>{summary?.expenseCount || 0} transactions</span>
              </div>
            </div>
          </div>
        )
      },
      {
        color: '#FFFFFF',
        content: (
          <div className="h-full flex flex-col justify-between p-2">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Activity size={20} /></div>
              <span className="font-medium">Financial Score</span>
            </div>
            <div>
              <h2 className="text-4xl font-light tracking-tight text-foreground mb-2">{summary?.financialScore || 0}<span className="text-2xl text-muted-foreground">/100</span></h2>
              <div className="flex items-center gap-1 text-sm text-primary">
                <Sparkles size={14} />
                <span>Pending AI Insights</span>
              </div>
            </div>
          </div>
        )
      },
      {
        color: '#FFFFFF',
        content: (
          <div className="h-full flex flex-col p-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-foreground">
                <div className="p-2 bg-secondary/30 border border-border rounded-lg"><LayoutDashboard size={20} /></div>
                <span className="font-medium text-lg">Recent Transactions</span>
              </div>
            </div>
            {filteredExpenses.length > 0 ? (
              <div className="space-y-3 overflow-y-auto pr-2">
                {filteredExpenses.map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border hover:bg-secondary/20 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                        <Wallet size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{exp.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`font-medium ${exp.type === 'INCOME' ? 'text-green-600' : 'text-destructive'}`}>
                      {exp.type === 'INCOME' ? '+' : '-'}₹{exp.amount}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <Wallet size={48} className="mb-4 opacity-30 stroke-1" />
                <p className="text-lg">No expenses found</p>
                {searchQuery ? <p className="text-sm mt-2 opacity-50">No matches for "{searchQuery}"</p> : <p className="text-sm mt-2 opacity-50">Log your first transaction with AI</p>}
              </div>
            )}
          </div>
        )
      },
      {
        color: '#FFFFFF',
        content: (
          <div className="h-full flex flex-col p-2 relative">
            <div className="flex items-center gap-3 text-primary mb-6 relative z-10">
              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-primary"><BrainCircuit size={20} /></div>
              <span className="font-medium text-lg">AI Advisor</span>
            </div>
            
            <div className="flex-1 relative z-10">
              {isInsightsLoading ? (
                <div className="p-5 rounded-2xl bg-secondary/10 border border-border flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <p className="text-sm text-foreground leading-relaxed font-light">Analyzing your financial patterns...</p>
                </div>
              ) : summary?.recentExpenses?.length > 0 ? (
                <div className="p-5 rounded-2xl bg-secondary/10 border border-border">
                  <p className="text-sm text-foreground leading-relaxed font-light">
                    {insights?.insight || 'Your recent spending looks normal. Continue logging expenses so our AI can begin analyzing your habits and providing personalized saving strategies!'}
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-secondary/10 border border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    Waiting for data. Once you log an expense, your personalized AI insights will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      },
      {
        color: '#FFFFFF',
        content: (
          <div className="h-full flex flex-col p-2">
            <div className="flex items-center gap-3 text-foreground mb-6">
              <div className="p-2 bg-secondary/30 border border-border rounded-lg"><PieChartIcon size={20} /></div>
              <span className="font-medium text-lg">Expense Breakdown</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ExpenseChart categoryData={summary?.categoryData || []} />
            </div>
          </div>
        )
      },
      {
        color: '#FFFFFF',
        content: (
          <div className="h-full flex flex-col p-2">
            <div className="flex items-center gap-3 text-foreground mb-6">
              <div className="p-2 bg-secondary/30 border border-border rounded-lg"><BarChart3 size={20} /></div>
              <span className="font-medium text-lg">Cash Flow Comparison</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ExpenseBarChart categoryData={summary?.allCategoryData || []} />
            </div>
          </div>
        )
      }
    ];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <MagicBento 
        cards={getBentoCards()} 
        glowColor="36, 95, 115" 
        enableTilt={false}
        enableMagnetism={true}
        enableStars={false}
      />
    </motion.div>
  );
}
