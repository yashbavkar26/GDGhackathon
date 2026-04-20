import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'kok', name: 'कोंकणी' }
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-black/20 border-b border-white/5"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-300 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4.07 16.05 4.07 12C4.07 11.5 4.12 11 4.2 10.53L9 15.33V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H10V10H12C12.55 10 13 9.55 13 9V7H15C16.1 7 17 6.1 17 5V4.65C19.34 6.36 20.89 9.07 20.89 12.15C20.89 14.28 20.08 16.2 17.9 17.39Z" fill="#000"/>
          </svg>
        </div>
        <span className="text-white font-semibold text-xl tracking-tight leading-none">CropGuard AI</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <Link to="/" className="text-white hover:text-green-400 transition-colors">{t('home')}</Link>
        <Link to="/disease-detection" className="hover:text-white transition-colors">{t('dashboard')}</Link>
        <Link to="/pest-heatmap" className="hover:text-white transition-colors">{t('side_pest')}</Link>
        <Link to="/weather-forecast" className="hover:text-white transition-colors">{t('weather')}</Link>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Language Switcher */}
        <div className="relative">
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium transition-all border border-white/5 hover:border-white/20"
          >
            <Globe className="w-4 h-4 text-green-400" />
            <span className="hidden sm:inline-block">{currentLang.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-36 bg-[#0a120e]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl py-1 z-50 flex flex-col"
              >
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      i18n.language === lang.code 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    🌐 {lang.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/disease-detection" className="hidden sm:inline-block px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/10 hover:border-white/30">
          {t('btn_start')}
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navbar;
