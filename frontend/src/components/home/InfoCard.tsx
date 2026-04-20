import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const InfoCard = () => {
  const { t } = useTranslation();

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
        {t('card_title')}
      </h3>

      <div className="space-y-6 relative z-10">
        <div className="group">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t('card_online')}
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

        <div className="pt-4 border-t border-white/10">
          <p className="text-white/50 text-xs font-medium mb-3">{t('card_metrics')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-2" />
              <p className="text-white font-bold text-lg">98%</p>
              <p className="text-white/40 text-[10px] uppercase">Safety</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
              <AlertTriangle className="w-4 h-4 text-orange-400 mb-2" />
              <p className="text-white font-bold text-lg">0</p>
              <p className="text-white/40 text-[10px] uppercase">Threats</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InfoCard;
