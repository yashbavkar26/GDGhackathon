import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, AlertTriangle } from "lucide-react";

const InfoCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1, type: "spring", stiffness: 100 }}
      className="absolute right-0 xl:right-4 top-1/2 -translate-y-1/2 w-72 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-6 overflow-hidden hidden lg:block"
      whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(16, 185, 129, 0.2)" }}
    >
      {/* Decorative gradient blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-400" />
        System Status
      </h3>

      <div className="space-y-6 relative z-10">
        <div className="group">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Monitoring
          </p>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, delay: 1.5 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
            />
          </div>
        </div>

        <div className="group flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
            <ShieldCheck className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-white tracking-tight">1,847</h4>
            <p className="text-white/50 text-xs font-medium mt-0.5">Crops Protected</p>
          </div>
        </div>

        <div className="group flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-white tracking-tight">23</h4>
            <p className="text-white/50 text-xs font-medium mt-0.5">Active Alerts</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5">
        <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5">
          View Detail Report
        </button>
      </div>
    </motion.div>
  );
};

export default InfoCard;
