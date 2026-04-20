import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import Hero3D from "@/components/home/Hero3D";
import Navbar from "@/components/home/Navbar";
import InfoCard from "@/components/home/InfoCard";

const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black">
    <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
  </div>
);

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen bg-[#020b06] text-white overflow-hidden selection:bg-green-500/30 font-sans">
      {/* Deep Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#020b06] to-[#010603] -z-10" />

      <Navbar />

      <main className="relative h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24">
        {/* 3D Background - Takes up full absolute space but rendered behind text */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <Suspense fallback={<Loader />}>
            <Hero3D />
          </Suspense>
        </div>

        {/* Info Card Floating on Right */}
        <div className="relative z-20">
          <InfoCard />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl mt-20 md:mt-0 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 mb-6 drop-shadow-sm">
              {t('hero_title_1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                {t('hero_title_2')}
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/60 max-w-xl mb-10 font-medium leading-relaxed"
          >
            {t('hero_desc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <button 
              onClick={() => window.location.href = '/disease-detection'}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-1"
            >
              {t('btn_start')}
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-lg flex items-center justify-center gap-3 transition-all">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Play className="w-4 h-4 ml-0.5 fill-current" />
              </div>
              {t('btn_demo')}
            </button>
          </motion.div>
        </div>

        {/* Bottom Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-0 left-0 right-0 z-20 px-8 py-8 md:px-16 lg:px-24 border-t border-white/5 bg-black/20 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-4 max-w-7xl mx-auto">
            
            <div className="flex items-center gap-6 group">
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                60M+
              </h2>
              <div className="w-px h-12 bg-white/10"></div>
              <p className="text-white/70 text-sm font-medium leading-snug w-48">
                {t('stats_farms')} <br />
                <span className="text-white/40">{t('stats_farms_desc')}</span>
              </p>
            </div>

            <div className="flex items-center gap-6 group">
              <h2 className="text-4xl md:text-5xl font-black text-white">
                98%
              </h2>
              <div className="w-px h-12 bg-white/10"></div>
              <p className="text-white/70 text-sm font-medium leading-snug w-48">
                {t('stats_accuracy')} <br />
                <span className="text-white/40">{t('stats_accuracy_desc')}</span>
              </p>
            </div>

            <div className="flex items-center gap-6 group">
              <h2 className="text-4xl md:text-5xl font-black text-white">
                24/7
              </h2>
              <div className="w-px h-12 bg-white/10"></div>
              <p className="text-white/70 text-sm font-medium leading-snug w-48">
                {t('stats_monitoring')} <br />
                <span className="text-white/40">{t('stats_monitoring_desc')}</span>
              </p>
            </div>
            
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
