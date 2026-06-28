import React from 'react';
import { Language, TranslationSet } from '../types';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  translations: TranslationSet;
  isEmbedMode: boolean;
  onToggleEmbedMode: (embed: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  translations,
  isEmbedMode,
  onToggleEmbedMode
}) => {
  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center gap-1.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-full bg-niu-main flex items-center justify-center text-white font-display font-extrabold text-xs tracking-tighter">
              N
            </div>
            <span className="font-display font-black text-xl tracking-tighter text-niu-dark">
              NIU<span className="text-niu-main">PROJECT</span>
            </span>
          </div>
          
          {/* NAVIGATION LINKS */}
          <div className="hidden md:flex space-x-12 items-center">
            <a 
              href="#inicio" 
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 hover:text-niu-dark hover:tracking-[0.2em] transition-all duration-300"
            >
              {translations.nav_home}
            </a>
            <a 
              href="#esencia" 
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 hover:text-niu-dark hover:tracking-[0.2em] transition-all duration-300"
            >
              {translations.nav_essence}
            </a>
            <a 
              href="#calculadora" 
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-niu-main hover:text-niu-dark transition-colors"
            >
              {translations.nav_calc}
            </a>
          </div>

          {/* CONTROL BAR: LANG & EMBED MODE TOGGLE */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* EMBED MODE PREVIEW PICKER */}
            <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-2">
              <button 
                onClick={() => onToggleEmbedMode(false)}
                className={`px-3 py-1.5 rounded-sm transition-all ${
                  !isEmbedMode 
                    ? 'bg-white text-niu-dark shadow-sm' 
                    : 'hover:text-niu-dark'
                }`}
              >
                {translations.embed_full}
              </button>
              <button 
                onClick={() => onToggleEmbedMode(true)}
                className={`px-3 py-1.5 rounded-sm transition-all ${
                  isEmbedMode 
                    ? 'bg-white text-niu-dark shadow-sm' 
                    : 'hover:text-niu-dark'
                }`}
              >
                {translations.embed_widget}
              </button>
            </div>

            {/* BILINGUAL SELECTOR */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4 sm:pl-6">
              <button 
                onClick={() => onLanguageChange('es')} 
                className={`text-[10px] font-black tracking-widest pb-0.5 transition-all ${
                  currentLang === 'es' 
                    ? 'text-niu-dark border-b-2 border-niu-dark' 
                    : 'text-gray-400 hover:text-niu-dark'
                }`}
              >
                ES
              </button>
              <span className="text-gray-300 text-xs">|</span>
              <button 
                onClick={() => onLanguageChange('ca')} 
                className={`text-[10px] font-black tracking-widest pb-0.5 transition-all ${
                  currentLang === 'ca' 
                    ? 'text-niu-dark border-b-2 border-niu-dark' 
                    : 'text-gray-400 hover:text-niu-dark'
                }`}
              >
                CA
              </button>
            </div>
            
          </div>
          
        </div>
      </div>
    </nav>
  );
};
