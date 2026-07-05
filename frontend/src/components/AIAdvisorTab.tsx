import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, TrendingDown, ArrowRight } from 'lucide-react';
import GlareHover from './GlareHover';

export default function AIAdvisorTab({ summary }: { summary: any }) {
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
              <button className="text-sm text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2">
                Generate Full Report <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </GlareHover>

        <div className="grid grid-cols-2 gap-6">
          <GlareHover
            glareOpacity={0.05}
            background="#0A1E3D"
            borderColor="#12284C"
            className="p-6 shadow-sm bg-card"
          >
            <div className="w-full">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-4">
                <TrendingDown size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Saving Opportunity</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">Consider cooking at home this weekend. You could save approximately ₹1,500 based on your current dining trends.</p>
            </div>
          </GlareHover>

          <GlareHover
            glareOpacity={0.05}
            background="#0A1E3D"
            borderColor="#12284C"
            className="p-6 shadow-sm bg-card"
          >
            <div className="w-full">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 mb-4">
                <Sparkles size={20} className="text-accent" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Excellent Habit</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">You haven't made any impulsive purchases in the 'Shopping' category this week. Keep it up!</p>
            </div>
          </GlareHover>
        </div>
      </div>
    </motion.div>
  );
}
