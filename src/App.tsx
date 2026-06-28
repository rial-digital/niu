import React from 'react';
import { Calculator } from './components/Calculator';
import { translations } from './translations';

export default function App() {
  const activeTranslations = translations.es;

  return (
    <div className="min-h-screen bg-transparent font-sans text-niu-text p-0">
      <div className="w-full max-w-4xl mx-auto">
        <Calculator currentLang="es" translations={activeTranslations} />
      </div>
    </div>
  );
}
