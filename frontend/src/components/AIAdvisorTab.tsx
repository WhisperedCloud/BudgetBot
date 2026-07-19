import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, ArrowRight } from 'lucide-react';
import GlareHover from './GlareHover';

export default function AIAdvisorTab({ summary }: { summary: any }) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full flex flex-col md:flex-row gap-6"
    >
      <div className="flex-1 space-y-6">
        <GlareHover
          glareOpacity={0.05}
          glareColor="#245F73"
          background="#0A1E3D"
          borderColor="#12284C"
          className="p-8 relative overflow-hidden shadow-sm bg-card"
        >
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
          
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <BrainCircuit size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-light text-foreground tracking-tight">AI Financial Briefing</h2>
                <p className="text-sm text-muted-foreground">Generated just now</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg font-light text-foreground leading-relaxed">
                Based on your recent transaction history of <strong className="font-medium text-primary">₹{summary?.totalExpenses || 0}</strong> across <strong className="font-medium text-primary">{summary?.expenseCount || 0} purchases</strong>, your spending velocity is currently stable.
              </p>
              <p className="text-muted-foreground leading-relaxed font-light">
                I noticed you haven't set up your budgets for this month yet. Setting up category limits can help me provide more targeted saving strategies and alert you before you overspend.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary text-sm">
                <Sparkles size={16} />
                <span>Powered by Gemini</span>
              </div>
              <button 
                onClick={() => setIsReportOpen(true)}
                className="text-sm text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
              >
                Generate Full Report <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </GlareHover>

        {/* Removed the two extra boxes */}
      </div>

      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden"
          >
            <button 
              onClick={() => setIsReportOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BrainCircuit size={24} />
              </div>
              <h2 className="text-2xl font-medium text-foreground">Full Financial Report</h2>
            </div>
            
            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              <div className="p-4 bg-secondary/10 rounded-xl border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Spending Overview</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">
                  You have spent a total of <strong className="text-primary font-medium">₹{summary?.totalExpenses?.toLocaleString() || 0}</strong> across <strong className="text-primary font-medium">{summary?.expenseCount || 0} transactions</strong> recently.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Balance</p>
                    <p className="text-xl font-medium text-foreground">₹{summary?.totalBalance?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Financial Score</p>
                    <p className="text-xl font-medium text-primary">{summary?.financialScore || 0}/100</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/10 rounded-xl border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">Top Categories</h3>
                <div className="space-y-3">
                  {summary?.categoryData && summary.categoryData.length > 0 ? (
                    summary.categoryData.slice(0, 3).map((cat: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-card rounded-lg border border-border">
                        <span className="font-medium text-foreground">{cat.name}</span>
                        <span className="text-muted-foreground">₹{cat.value.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground font-light">No category data available.</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-secondary/10 rounded-xl border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">AI Recommendation</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  To improve your financial score, consider setting strict budget limits for your top spending categories. Monitoring your daily velocity will help prevent end-of-month cash flow issues.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
