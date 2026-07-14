import React from 'react';
import { motion } from 'framer-motion';
import { Bell, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getDynamicGreeting } from '../../lib/personalization/engine';

interface HeaderProps {
  userProfile: any;
  handleLogout: () => void;
  isLoggingOut: boolean;
}

export function Header({ userProfile, handleLogout, isLoggingOut }: HeaderProps) {
  return (
    <header className="px-6 pt-10 pb-6 flex justify-between items-center z-10 relative">
      <div>
      <motion.h1 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-2xl font-black tracking-tighter"
        >
          NUVYU<span className="text-[#00FFA3]">.AI</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
          className="text-white/50 text-sm font-medium mt-1 capitalize"
        >
          {getDynamicGreeting()}, {userProfile?.full_name ? userProfile.full_name.split(' ')[0] : 'Athlete'}.
        </motion.p>
      </div>
      <div className="flex gap-3 items-center">
      <motion.button 
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-white/60 shrink-0"
          >
            {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          </motion.button>
          
          <motion.div 
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <Bell size={18} className="text-white/80" />
          </motion.div>

          <Link href="/profile">
            <motion.div 
              whileTap={{ scale: 0.92 }}
              onTapStart={() => { if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10); }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md overflow-hidden hover:border-[#00FFA3]/50 transition-all cursor-pointer shrink-0"
            >
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile?.full_name || userProfile?.email || 'user')}&backgroundColor=00FFA3&textColor=000000`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </Link>
      </div>
    </header>
  );
}
