import { motion } from 'framer-motion';
import { Globe, LayoutDashboard, ArrowRight } from 'lucide-react';

type AppView = 'entry' | 'website' | 'crm' | 'login';

interface EntryPageProps {
  onNavigate: (view: AppView) => void;
}

export function EntryPage({ onNavigate }: EntryPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] flex flex-col items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A962]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C9A962]/3 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <img
            src="/images/amt-logo.png"
            alt="AMT Solutions"
            className="h-16 mx-auto mb-6"
          />
          <p className="text-[#888] text-sm tracking-widest uppercase">
            Business Development
          </p>
        </motion.div>

        {/* Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          {/* Website Card */}
          <button
            onClick={() => onNavigate('website')}
            className="group w-full bg-gradient-to-r from-[#1a1a1a] to-[#222] hover:from-[#222] hover:to-[#2a2a2a] border border-[#333] hover:border-[#C9A962]/50 rounded-2xl p-6 transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-[#C9A962]/10 flex items-center justify-center group-hover:bg-[#C9A962]/20 transition-colors">
                <Globe className="w-7 h-7 text-[#C9A962]" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-white font-semibold text-lg mb-1">Visit Website</h2>
                <p className="text-[#888] text-sm">Explore our services and portfolio</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#666] group-hover:text-[#C9A962] group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* CRM Card */}
          <button
            onClick={() => onNavigate('login')}
            className="group w-full bg-gradient-to-r from-[#1a1a1a] to-[#222] hover:from-[#222] hover:to-[#2a2a2a] border border-[#333] hover:border-[#C9A962]/50 rounded-2xl p-6 transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-[#C9A962]/10 flex items-center justify-center group-hover:bg-[#C9A962]/20 transition-colors">
                <LayoutDashboard className="w-7 h-7 text-[#C9A962]" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-white font-semibold text-lg mb-1">Access CRM</h2>
                <p className="text-[#888] text-sm">Manage leads, projects & invoices</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#666] group-hover:text-[#C9A962] group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-[#555] text-xs">
            © {new Date().getFullYear()} AMT Solutions. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
