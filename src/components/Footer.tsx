import React from 'react';
import { TranslationSet } from '../types';

interface FooterProps {
  translations: TranslationSet;
}

export const Footer: React.FC<FooterProps> = ({ translations }) => {
  return (
    <footer className="bg-white border-t border-gray-100 py-16 text-center">
      <div className="max-w-7xl mx-auto px-4">
        {/* LOGO */}
        <div className="flex items-center justify-center gap-1.5 mb-4 select-none">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-display font-extrabold text-[9px] tracking-tighter">
            N
          </div>
          <span className="font-display font-black text-lg tracking-tighter text-gray-300">
            NIU<span className="text-gray-400">PROJECT</span>
          </span>
        </div>
        
        {/* LINKS */}
        <div className="flex justify-center gap-8 mb-8 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          <a href="#inicio" className="hover:text-niu-dark transition-colors">{translations.nav_home}</a>
          <a href="#esencia" className="hover:text-niu-dark transition-colors">{translations.nav_essence}</a>
          <a href="#calculadora" className="hover:text-niu-dark transition-colors">{translations.nav_calc}</a>
        </div>

        <p className="text-gray-300 text-xs font-light">
          © {new Date().getFullYear()} NIU Project. Barcelona. {translations.hero_badge}.
        </p>
      </div>
    </footer>
  );
};
