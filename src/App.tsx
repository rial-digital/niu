import React from 'react';
import { Calculator } from './components/Calculator';
import { translations } from './translations';

export default function App() {
  const activeTranslations = translations.es;

  return (
    <div className="min-h-screen bg-transparent font-sans text-niu-text py-2 sm:py-6 px-1">
      <div className="w-full max-w-4xl mx-auto">
        <Calculator currentLang="es" translations={activeTranslations} />
      </div>
    </div>
  );
}
