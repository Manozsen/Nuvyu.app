import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

export function BottomNav() {
  return (
    <div className="fixed bottom-6 left-6 right-6 flex justify-center z-40">
      <nav className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-12 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <Link href="/reports">
          <LayoutDashboard size={24} className="text-[#00FFA3]" strokeWidth={2.5} />
        </Link>
        
        <Link href="/log">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className="bg-[#00FFA3] p-4 rounded-full shadow-[0_0_30px_rgba(0,255,163,0.4)] text-black cursor-pointer -mt-8 border-4 border-black flex items-center justify-center"
          >
            <Plus size={28} strokeWidth={3} />
          </motion.div>
        </Link>
        
        <Link href="/profile">
          <Settings size={24} className="text-white/40 hover:text-white transition-colors cursor-pointer" />
        </Link>
      </nav>
    </div>
  );
}
