import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Search, 
  Trees, 
  Gem, 
  Wind, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Check, 
  Info,
  Home,
  User,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Droplet,
  Zap,
  Hammer,
  Layers,
  Bed,
  Bath,
  Briefcase
} from 'lucide-react';
import { FormData, Language, TranslationSet } from '../types';

interface CalculatorProps {
  currentLang: Language;
  translations: TranslationSet;
}

// Pricing definitions representing realistic rates for standard/premium/luxury modular timber systems
const PRICES = {
  m2_basic: 1750,
  m2_premium: 1900,
  m2_extraordinary: 2050,
  // Exteriors
  fencing: 8500,
  porch: 11500,
  landscaping: 5500,
  pool: 21000,
  // Sustainability extras
  waterRecycling: 4800,
  waterFiltration: 5500, // Updated dynamically as requested to 5.500 €
  solarPanels: 14400 // Updated to the exact 14.400 € cost of the reference 12 modules fotovaltic kit 
};

const PROVINCES = [
  'Barcelona', 'Madrid', 'Baleares', 'Alicante', 'Valencia', 'Girona', 'Sevilla', 'Málaga', 'Álava', 'Vizcaya', 'Guipúzcoa', 'Zaragoza', 'Las Palmas', 'Santa Cruz de Tenerife', 'Navarra', 'Cantabria', 'Asturias', 'Pontevedra', 'Tarragona',
  'Albacete', 'Almería', 'Ávila', 'Badajoz', 'Burgos', 'Cáceres', 'Cádiz', 'Castellón', 'Ciudad Real', 'Córdoba', 'Coruña', 'Cuenca', 'Granada', 'Guadalajara', 'Huelva', 'Huesca', 'Jaén', 'León', 'Lleida', 'Lugo', 'Murcia', 'Ourense', 'Palencia', 'La Rioja', 'Salamanca', 'Segovia', 'Soria', 'Teruel', 'Toledo', 'Valladolid', 'Zamora', 'Ceuta', 'Melilla'
];

export const Calculator: React.FC<CalculatorProps> = ({ currentLang, translations }) => {
  // Steps:
  // Step 1: Terreno
  // Step 2: Huella de la casa (m2) + Esquema visual
  // Step 3: Distribución (Floors, Rooms, Baths, Workspaces)
  // Step 4: Exteriores (Fencing, Porch, Landscaping, Pool)
  // Step 5: Sostenibilidad y Salud (A/A+ insulation, Aerotermia & extras)
  // Step 6: Acabados (Basic, Premium, Extraordinary)
  // Step 7: Formulario de Contacto & Presupuesto Final
  const [step, setStep] = useState<number>(1);
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitError, setIsSubmitError] = useState<boolean>(false);
  const [shakeButton, setShakeShake] = useState<boolean>(false);

  // New expanded form state
  const [formData, setFormData] = useState<FormData>({
    projectType: 'unifamiliar',
    plotM2: 500,
    plotLocation: '',
    plotProvince: 'Barcelona', // Default selected province
    cadastralRef: '',
    houseM2: 120,
    floors: 1,
    rooms: 3,
    baths: 2,
    workspaces: 1,
    fencing: false,
    porch: false,
    landscaping: false,
    pool: false,
    waterRecycling: false,
    waterFiltration: false,
    solarPanels: false,
    finish: 'premium' // default choice
  });

  // Dynamic dimensions for selected optional extras
  const [porchM2, setPorchM2] = useState<number>(15);
  const [poolM2, setPoolM2] = useState<number>(18);
  const [customLandscapingM2, setCustomLandscapingM2] = useState<number | null>(null);

  // User details for lead collection
  const [userDetails, setUserDetails] = useState({
    nombre: '',
    telefono: '',
    email: '',
    localidad: '',
    detalles: '',
    tipoContacto: 'videocall' // 'videocall' | 'phone' | 'presencial' | 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [dossierDownloaded, setDossierDownloaded] = useState<boolean>(false);
  const [activeCalendlyUrl, setActiveCalendlyUrl] = useState<string | null>(null);
  const [bookedEvent, setBookedEvent] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleCalendlyMessage = (e: MessageEvent) => {
      if (e.data && e.data.event && e.data.event.indexOf('calendly') === 0) {
        if (e.data.event === 'calendly.event_scheduled') {
          setBookedEvent(true);
        }
      }
    };

    window.addEventListener('message', handleCalendlyMessage);
    return () => {
      window.removeEventListener('message', handleCalendlyMessage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ResizeObserver) return;
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Measure element including padding, border, and margin spacing
        const height = element.scrollHeight || entry.contentRect.height;
        // Post message to the parent frame and topmost frame (Framer website)
        try {
          window.parent.postMessage({
            type: 'niu-resize',
            height: height
          }, '*');
          if (window.top && window.top !== window.parent) {
            window.top.postMessage({
              type: 'niu-resize',
              height: height
            }, '*');
          }
        } catch (e) {
          // Fallback if security restrictions block window.top access
          console.warn("Could not post message to window.top:", e);
        }
      }
    });

    resizeObserver.observe(element);
    
    // Also trigger initial measurement immediately
    const initialHeight = element.scrollHeight || element.offsetHeight;
    if (initialHeight) {
      try {
        window.parent.postMessage({
          type: 'niu-resize',
          height: initialHeight
        }, '*');
        if (window.top && window.top !== window.parent) {
          window.top.postMessage({
            type: 'niu-resize',
            height: initialHeight
          }, '*');
        }
      } catch (e) {
        console.warn("Could not post initial message to window.top:", e);
      }
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [step, isSuccess]);

  // Scroll to top of the calculator whenever step, success status or active calendly URL changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Smooth scroll inside the iframe to the top of our calculator container
    try {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      window.scrollTo(0, 0);
    }

    // Google Tag Manager - Push granular interaction events to window.dataLayer
    try {
      const dataLayer = (window as any).dataLayer || [];
      const stepNames: Record<number, string> = {
        1: '1. Tipo de Proyecto',
        2: '2. Provincia y Dimensiones',
        3: '3. Distribución',
        4: '4. Acabados y Extras',
        5: '5. Equipamiento y Contacto',
        6: '6. Estudio de Viabilidad'
      };

      const currentStepName = stepNames[step] || `Paso ${step}`;

      // Push custom step change event to GTM
      dataLayer.push({
        event: 'niu_step_change',
        step_number: step,
        step_name: currentStepName,
        project_type: formData.projectType || 'unifamiliar',
        province: formData.plotProvince || 'Barcelona',
        is_success: isSuccess
      });

      // Track successful lead generation when user reaches step 6 and isSuccess is true
      if (isSuccess && step === 6) {
        dataLayer.push({
          event: 'niu_lead_success',
          project_type: formData.projectType || 'unifamiliar',
          province: formData.plotProvince || 'Barcelona'
        });
      }
    } catch (gtmError) {
      console.warn("Could not push GTM event to dataLayer:", gtmError);
    }

    // Post a message to Framer (parent/top frame) notifying about the step change.
    // This allows custom code in Framer to also scroll the parent window to the top of the iframe section.
    try {
      window.parent.postMessage({
        type: 'niu-step-change',
        step: step,
        isSuccess: isSuccess,
        hasCalendly: !!activeCalendlyUrl
      }, '*');
      if (window.top && window.top !== window.parent) {
        window.top.postMessage({
          type: 'niu-step-change',
          step: step,
          isSuccess: isSuccess,
          hasCalendly: !!activeCalendlyUrl
        }, '*');
      }
    } catch (e) {
      console.warn("Could not post step change message to parent window:", e);
    }
  }, [step, isSuccess, activeCalendlyUrl, formData.projectType, formData.plotProvince]);

  // Direct toggle function for boolean choices
  const toggleField = (key: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setErrors(null);
  };

  // Select key function
  const selectFinish = (value: FormData['finish']) => {
    setFormData(prev => ({ ...prev, finish: value }));
    setErrors(null);
  };

  // Validation engine
  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.projectType) {
        setErrors("Por favor, selecciona un tipo de solución arquitectónica.");
        triggerShake();
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.plotLocation.trim()) {
        const typeLabel = formData.projectType === 'remontas' ? 'edificio' : 'terreno';
        setErrors(`Por favor, introduce la ubicación de tu ${typeLabel} para continuar.`);
        triggerShake();
        return false;
      }
      if (!formData.plotM2 || formData.plotM2 <= 0) {
        const typeLabel = formData.projectType === 'remontas' ? 'la planta del edificio' : 'la parcela';
        setErrors(`Por favor, introduce una superficie de ${typeLabel} válida.`);
        triggerShake();
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.houseM2 || formData.houseM2 <= 0) {
        setErrors("Por favor, especifica la superficie construible total que deseas tener.");
        triggerShake();
        return false;
      }
    }
    setErrors(null);
    return true;
  };

  const triggerShake = () => {
    setShakeShake(true);
    setTimeout(() => setShakeShake(false), 500);
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 1 && formData.projectType === 'cohousing') {
        setStep(6);
      } else {
        setStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setErrors(null);
    if (step === 6 && formData.projectType === 'cohousing') {
      setStep(1);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const getStepHeader = () => {
    switch (step) {
      case 1:
        return {
          title: "Tipo de Proyecto",
          subtitle: "Selecciona la solución que se adapta a tu búsqueda.",
          icon: <Home className="text-niu-main w-6 h-6 shrink-0" />,
          stepName: "1. TIPO DE PROYECTO"
        };
      case 2:
        return {
          title: formData.projectType === 'remontas' ? "Tu Edificio original" : "Tu Terreno",
          subtitle: formData.projectType === 'remontas' 
            ? "Especifica los datos básicos sobre la edificación o espacio urbano donde se realizará la remonta en altura." 
            : "Especifica la información básica de la parcela o terreno donde se asentará tu futuro hogar.",
          icon: <MapPin className="text-niu-main w-6 h-6 shrink-0" />,
          stepName: formData.projectType === 'remontas' ? "2. INFORMACIÓN DEL EDIFICIO" : "2. TU TERRENO"
        };
      case 3:
        return {
          title: "Dimensiones y Estancias",
          subtitle: "Especifica la superficie construible total deseada y la distribución de estancias de tu futura vivienda.",
          icon: <Layers className="text-niu-main w-6 h-6 shrink-0" />,
          stepName: "3. DIMENSIONES Y ESTANCIAS"
        };
      case 4:
        return {
          title: "Exteriores y Adicionales",
          subtitle: "Selecciona los adicionales exteriores que te interesen para tu parcela. Los costes se calculan dinámicamente y se presupuestan de forma independiente a la vivienda estándar.",
          icon: <Trees className="text-niu-main w-6 h-6 shrink-0" />,
          stepName: "4. EXTERIORES Y EQUIPAMIENTO"
        };
      case 5:
        return {
          title: "Sostenibilidad y Salud",
          subtitle: "Tu casa respira contigo. Revisa los equipamientos de sostenibilidad ecológica incorporados y opcionales.",
          icon: <Wind className="text-niu-main w-6 h-6 shrink-0" />,
          stepName: "5. SOSTENIBILIDAD Y SALUD"
        };
      case 6:
        return {
          title: "Consigue tu Estudio de Viabilidad",
          subtitle: "Introduce tus datos de contacto para enviarte el dossier técnico pormenorizado de calidades y coordinar un primer análisis con arquitectura.",
          icon: <FileText className="text-niu-main w-6 h-6 shrink-0" />,
          stepName: "6. ESTUDIO DE VIABILIDAD"
        };
      default:
        return {
          title: "",
          subtitle: "",
          icon: null,
          stepName: ""
        };
    }
  };

  // Comprehensive construction price compilation
  const calculateCosts = () => {
    // If cohousing, do not calculate or return any prices
    if (formData.projectType === 'cohousing') {
      return {
        builtinArea: 0,
        baseRate: 0,
        structureCost: 0,
        estimatedPerimeter: 0,
        landscapingArea: 0,
        defaultGardenArea: 0,
        fencingCost: 0,
        porchCost: 0,
        landscapingCost: 0,
        poolCost: 0,
        exteriorsCost: 0,
        recyclingCost: 0,
        filtrationCost: 0,
        solarCost: 0,
        sustainabilityCost: 0,
        total: 0
      };
    }

    // Total built area is entered directly by the user as houseM2, representing the total desired construction area.
    const builtinArea = formData.houseM2 || 0;
    
    // Choose base price per built m2 depending on selected Spanish province of the plot and multiplier tension
    let coefficient = 1.0;
    const highTensionProv = [
      'Barcelona', 'Madrid', 'Baleares', 'Guipúzcoa', 'Gipuzkoa', 'Vizcaya', 'Bizkaia', 'Málaga', 'Álava', 'Araba'
    ];
    const mediumTensionProv = [
      'Alicante', 'Alacant', 'Valencia', 'València', 'Sevilla', 'Zaragoza', 'Las Palmas', 'Santa Cruz de Tenerife', 'Girona', 'Gerona', 'Navarra', 'Cantabria', 'Asturias', 'Pontevedra', 'Tarragona'
    ];
    
    const prov = formData.plotProvince || 'Barcelona';
    if (highTensionProv.includes(prov)) {
      coefficient = 1.17;
    } else if (mediumTensionProv.includes(prov)) {
      coefficient = 1.085;
    } else {
      coefficient = 1.0;
    }

    const baseRate = Math.round(1750 * coefficient);
    const structureCost = builtinArea * baseRate;

    // Computed landscaping area:
    const estimatedFootprint = Math.round((formData.houseM2 || 0) / (formData.floors || 1));
    const defaultGardenArea = Math.max(0, (formData.plotM2 || 0) - estimatedFootprint);
    const landscapingArea = customLandscapingM2 !== null ? customLandscapingM2 : defaultGardenArea;

    // --- Dynamic Exteriores calculation ---
    // 1. Vallado: Based on perimeter of square plot of area plotM2: 4 * Math.sqrt(plotM2) * 200 €/m
    const estimatedPerimeter = Math.round(4 * Math.sqrt(formData.plotM2 || 0));
    // Fencing not applicable to remontas
    const fencingCost = (formData.projectType !== 'remontas' && formData.fencing) ? Math.round(estimatedPerimeter * 200) : 0;

    // 2. Porche: porchM2 * 300 €/m²
    const porchCost = formData.porch ? Math.round(porchM2 * 300) : 0;

    // 3. Paisajismo: landscapingArea * 50 €/m²
    const landscapingCost = formData.landscaping ? Math.round(landscapingArea * 50) : 0;

    // 4. Piscina: poolM2 * 1100 €/m² (depth 1.5m)
    // Pool not applicable to remontas
    const poolCost = (formData.projectType !== 'remontas' && formData.pool) ? Math.round(poolM2 * 1100) : 0;

    const exteriorsCost = fencingCost + porchCost + landscapingCost + poolCost;

    // Sostenibilidad Extras prices (for notation, not included in standard total)
    // Rainwater recycling not applicable to remontas
    const recyclingCost = (formData.projectType !== 'remontas' && formData.waterRecycling) ? PRICES.waterRecycling : 0;
    const filtrationCost = formData.waterFiltration ? PRICES.waterFiltration : 0;
    const solarCost = formData.solarPanels ? PRICES.solarPanels : 0;
    const sustainabilityCost = recyclingCost + filtrationCost + solarCost;

    // Standard total only incorporates the core building with preselected standards
    const total = structureCost;

    return {
      builtinArea,
      baseRate,
      structureCost,
      estimatedPerimeter,
      landscapingArea,
      defaultGardenArea,
      fencingCost,
      porchCost,
      landscapingCost,
      poolCost,
      exteriorsCost,
      recyclingCost,
      filtrationCost,
      solarCost,
      sustainabilityCost,
      total
    };
  };

  const costBreakdown = calculateCosts();

  const handleDownloadDossier = () => {
    setDossierDownloaded(true);
    
    const labelProyecto = formData.projectType === 'cohousing' ? 'Cohousing y Comunidades' :
                          formData.projectType === 'remontas' ? 'Remontas Urbanas' :
                          'Vivienda Unifamiliar';
    
    const isCohousing = formData.projectType === 'cohousing';

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Estudio de Viabilidad Preliminar - NIU PROJECT</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      color: #1c1917;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .print-button-container {
      background-color: #f5f5f4;
      border: 1px solid #e7e5e4;
      padding: 16px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }
    .print-btn {
      background-color: #1c1917;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 3px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }
    .print-btn:hover {
      background-color: #44403c;
    }
    .header {
      border-bottom: 2px solid #1c1917;
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.025em;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #78716c;
    }
    .date-info {
      text-align: right;
      font-size: 11px;
      color: #78716c;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .card {
      background-color: #fafaf9;
      border: 1px solid #e7e5e4;
      padding: 24px;
      border-radius: 4px;
    }
    .card h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #78716c;
      border-bottom: 1px solid #e7e5e4;
      padding-bottom: 8px;
    }
    .card p {
      margin: 8px 0;
      font-size: 13px;
    }
    .card strong {
      color: #44403c;
    }
    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #44403c;
      border-bottom: 1px solid #e7e5e4;
      padding-bottom: 8px;
      margin-top: 32px;
      margin-bottom: 16px;
    }
    .extra-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    .extra-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f4;
    }
    .extra-item:last-child {
      border-bottom: none;
    }
    .extra-name {
      color: #44403c;
    }
    .extra-price {
      font-weight: 500;
      color: #1c1917;
    }
    .total-container {
      background-color: #f5f5f4;
      border: 1px solid #e7e5e4;
      padding: 20px 24px;
      border-radius: 4px;
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #78716c;
    }
    .total-value {
      font-size: 24px;
      font-weight: 800;
      color: #1c1917;
    }
    .disclaimer-section {
      margin-top: 48px;
      border-top: 1px solid #d6d3d1;
      padding-top: 24px;
    }
    .disclaimer-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #44403c;
      margin-bottom: 12px;
    }
    .disclaimer-text {
      font-size: 10px;
      color: #78716c;
      line-height: 1.6;
      text-align: justify;
      margin-bottom: 12px;
    }
    
    @media print {
      body {
        font-size: 12px;
      }
      .container {
        margin: 0;
        padding: 0;
        max-width: 100%;
      }
      .print-button-container {
        display: none !important;
      }
      .card {
        background-color: transparent !important;
        border: 1px solid #d6d3d1 !important;
      }
      .total-container {
        background-color: transparent !important;
        border: 1px solid #d6d3d1 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-button-container">
      <div style="font-size: 13px; color: #44403c;">
        <strong>¡Tu estudio está listo para imprimir!</strong> Abre el menú de tu sistema para guardar como PDF.
      </div>
      <button onclick="window.print()" class="print-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Imprimir / Guardar PDF
      </button>
    </div>

    <div class="header">
      <div>
        <h1>NIU PROJECT</h1>
        <p>Sistemas de Arquitectura Sostenible</p>
      </div>
      <div class="date-info">
        <div>Estudio de Viabilidad Preliminar</div>
        <div style="margin-top: 4px;">Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Datos de Contacto</h3>
        <p><strong>Nombre:</strong> ${userDetails.nombre || 'N/A'}</p>
        <p><strong>Teléfono:</strong> ${userDetails.telefono || 'N/A'}</p>
        <p><strong>Email:</strong> ${userDetails.email || 'N/A'}</p>
      </div>
      <div class="card">
        <h3>Proyecto Seleccionado</h3>
        <p><strong>Tipo de Proyecto:</strong> ${labelProyecto}</p>
        ${!isCohousing ? `
          <p><strong>Superficie Deseada:</strong> ${formData.houseM2} m²</p>
          <p><strong>Distribución:</strong> ${formData.floors} ${formData.floors === 1 ? 'planta' : 'plantas'}, ${formData.rooms} dorm., ${formData.baths} baños</p>
        ` : ''}
      </div>
    </div>

    ${!isCohousing ? `
      <div class="section-title">Detalle de Inversión</div>
      <ul class="extra-list">
        <li class="extra-item">
          <span class="extra-name">Estructura y Acabados de Alta Eficiencia (Madera)</span>
          <span class="extra-price">${costBreakdown.structureCost.toLocaleString('es-ES')} €</span>
        </li>
        ${formData.fencing ? `
          <li class="extra-item">
            <span class="extra-name">Cerramiento de parcela (~${costBreakdown.estimatedPerimeter} m de valla)</span>
            <span class="extra-price">~${costBreakdown.fencingCost.toLocaleString('es-ES')} €</span>
          </li>
        ` : ''}
        ${formData.porch ? `
          <li class="extra-item">
            <span class="extra-name">Porche de madera bioclimático (${porchM2} m²)</span>
            <span class="extra-price">~${costBreakdown.porchCost.toLocaleString('es-ES')} €</span>
          </li>
        ` : ''}
        ${formData.landscaping ? `
          <li class="extra-item">
            <span class="extra-name">Proyecto de Paisajismo y Jardín (${costBreakdown.landscapingArea} m²)</span>
            <span class="extra-price">~${costBreakdown.landscapingCost.toLocaleString('es-ES')} €</span>
          </li>
        ` : ''}
        ${formData.pool ? `
          <li class="extra-item">
            <span class="extra-name">Piscina integrada de diseño (${poolM2} m²)</span>
            <span class="extra-price">~${costBreakdown.poolCost.toLocaleString('es-ES')} €</span>
          </li>
        ` : ''}
        ${formData.waterRecycling ? `
          <li class="extra-item">
            <span class="extra-name">Reaprovechamiento integral de agua de lluvia</span>
            <span class="extra-price">~${costBreakdown.recyclingCost.toLocaleString('es-ES')} €</span>
          </li>
        ` : ''}
        ${formData.waterFiltration ? `
          <li class="extra-item">
            <span class="extra-name">Sistema central purificado de agua potable</span>
            <span class="extra-price">~${costBreakdown.filtrationCost.toLocaleString('es-ES')} €</span>
          </li>
        ` : ''}
        ${formData.solarPanels ? `
          <li class="extra-item">
            <span class="extra-name">Placas solares fotovoltaicas (Instalación de autoconsumo)</span>
            <span class="extra-price">~${costBreakdown.solarCost.toLocaleString('es-ES')} €</span>
          </li>
        ` : ''}
      </ul>

      <div class="total-container">
        <span class="total-label">Total Estimado Base (Sin IVA)</span>
        <span class="total-value">${costBreakdown.total.toLocaleString('es-ES')} €</span>
      </div>
    ` : `
      <div style="text-align: center; padding: 40px 20px; border: 1px dashed #d6d3d1; border-radius: 4px; color: #78716c; font-size: 14px; font-weight: 300;">
        Proyecto de Cohousing/Comunidad registrado. Nuestro equipo se pondrá en contacto para elaborar un estudio de viabilidad y presupuesto personalizado de acuerdo a las especificaciones de la comunidad.
      </div>
    `}

    <div class="disclaimer-section">
      <div class="disclaimer-title">Aviso Importante y Cláusula de No Vinculación</div>
      <p class="disclaimer-text">
        Se trata de un documento de resumen con valores orientativos aproximados basados en estimaciones genéricas de mercado de NIU Project. Esta valoración preliminar se realiza de forma totalmente orientativa y proporcional a los m² de edificación configurados. Existen múltiples partidas técnicas y administrativas que están expresamente excluidas de este cálculo (por ejemplo: estudio geotécnico y topográfico del terreno, tasas de licencias municipales, dirección técnica de obra, acometidas a servicios urbanos, excavaciones o cimentaciones especiales requeridas por la tipología del suelo, o IVA aplicable).
      </p>
      <p class="disclaimer-text">
        Este documento de resumen no es contractual ni vinculante, no constituye una oferta comercial y no compromete en ningún caso a NIU Project a realizar trabajos ni a proveer materiales por los precios o parámetros aquí reflejados. Los importes y calidades finales del proyecto quedarán sujetos única y exclusivamente al correspondiente estudio técnico detallado y al contrato de obra formalizado entre ambas partes.
      </p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Estudio_Viabilidad_NIU_${userDetails.nombre?.trim().replace(/\s+/g, '_') || 'Cliente'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPrefilledCalendlyUrl = (baseUrl: string) => {
    try {
      const url = new URL(baseUrl);
      
      // Standard Calendly prefill parameters
      if (userDetails.nombre) {
        url.searchParams.set('name', userDetails.nombre.trim());
      }
      if (userDetails.email) {
        url.searchParams.set('email', userDetails.email.trim());
      }
      if (userDetails.telefono) {
        // Calendly's built-in field prefill parameter
        url.searchParams.set('phone_number', userDetails.telefono.trim());
        // Custom question prefill backup (many Calendly forms use custom question as a1/a2 for phone)
        url.searchParams.set('a1', userDetails.telefono.trim());
      }
      
      // Prepare a concise, clean summary of their selections to show to the admin
      const extrasList: string[] = [];
      if (formData.fencing) extrasList.push('Valla');
      if (formData.porch) extrasList.push('Porche');
      if (formData.landscaping) extrasList.push('Jardín');
      if (formData.pool) extrasList.push('Piscina');
      if (formData.solarPanels) extrasList.push('Solar');
      if (formData.waterRecycling) extrasList.push('Agua Lluvia');
      if (formData.waterFiltration) extrasList.push('Agua Purificada');
      
      const extrasStr = extrasList.length > 0 ? ` + Extras: ${extrasList.join(', ')}` : '';
      const summaryText = `${formData.projectType === 'cohousing' ? 'Cohousing' : `Casa ${formData.houseM2} m² (${formData.floors} pl, ${formData.rooms} dorm)`}${extrasStr}. Presupuesto est.: ${costBreakdown.total.toLocaleString('es-ES')} €`;
      
      // Pass the summary text to standard custom question param a2
      url.searchParams.set('a2', summaryText);
      // Also write in a3 as backup
      url.searchParams.set('a3', summaryText);
      
      // Set industry-standard UTM parameters that automatically populate in Calendly's dashboard
      url.searchParams.set('utm_source', 'niu_calculator');
      url.searchParams.set('utm_medium', 'interactive_calculator');
      url.searchParams.set('utm_campaign', formData.projectType);
      url.searchParams.set('utm_content', summaryText);
      
      // Embed optimization parameters
      url.searchParams.set('hide_landing_page_details', '1');
      url.searchParams.set('hide_gdpr_banner', '1');
      
      return url.toString();
    } catch (e) {
      return baseUrl;
    }
  };

  const handleInitiateBooking = (baseUrl: string) => {
    const url = getPrefilledCalendlyUrl(baseUrl);
    setActiveCalendlyUrl(url);
  };

  const handleUserDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  // Lead dispatching via Formspree API
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userDetails.nombre.trim() || !userDetails.telefono.trim() || !userDetails.email.trim()) {
      setErrors("Por favor, rellena los campos obligatorios del formulario.");
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setIsSubmitError(false);

    const labelProyecto = formData.projectType === 'cohousing' ? 'Cohousing y Comunidades' :
                          formData.projectType === 'remontas' ? 'Remontas Urbanas' :
                          'Vivienda Unifamiliar';

    const payload = {
      tipo_solicitud: `Calculación Integral del Proyecto (${labelProyecto})`,
      tipo_proyecto: labelProyecto,
      ubicacion_proyecto: formData.plotLocation,
      superficie_terreno_m2: formData.plotM2,
      referencia_catastral: formData.cadastralRef || "No aportada",
      huella_vivienda_m2: formData.houseM2,
      plantas: formData.floors,
      total_construido_m2: costBreakdown.builtinArea,
      dormitorios: formData.rooms,
      baños: formData.baths,
      espacio_trabajo: formData.workspaces,
      // Exteriores y sus dimensiones dinámicas
      cerramiento_parcela: formData.fencing ? `Sí (Perímetro est.: ${costBreakdown.estimatedPerimeter} m, Coste est.: ${costBreakdown.fencingCost} €)` : "No",
      porche: formData.porch ? `Sí (${porchM2} m², Coste est.: ${costBreakdown.porchCost} €)` : "No",
      proyecto_paisajismo: formData.landscaping ? `Sí (${costBreakdown.landscapingArea} m², Coste est.: ${costBreakdown.landscapingCost} €)` : "No",
      piscina: formData.pool ? `Sí (${poolM2} m², Coste est.: ${costBreakdown.poolCost} €)` : "No",
      // Sostenibilidad
      sostenibilidad_reaprovechamiento_agua: formData.waterRecycling ? "Sí" : "No",
      sostenibilidad_agua_potable_saludable: formData.waterFiltration ? "Sí" : "No",
      sostenibilidad_placas_solares: formData.solarPanels ? "Sí" : "No",
      // Acabados
      gama_acabados: `Estándar (Base ${costBreakdown.baseRate} €/m²)`,
      // Contact Type
      modalidad_contacto_solicitada: userDetails.tipoContacto === 'videocall' ? 'Videollamada Online (Teams/Meet)' :
                                     userDetails.tipoContacto === 'phone' ? 'Llamada Telefónica Tradicional' :
                                     userDetails.tipoContacto === 'presencial' ? 'Reunión Presencial en Despacho (La Garriga, Barcelona)' :
                                     'Solo Información Escrita por Email',
      // Presupuesto
      presupuesto_estimado_total: `${costBreakdown.total.toLocaleString('es-ES')} €`,
      ...userDetails
    };

    // Retry system with exponential backoff
    let retries = 5;
    let delay = 1000;
    let success = false;

    while (retries > 0 && !success) {
      try {
        // Enviar a la Web App de Google Sheets suministrada por el usuario.
        // Se utiliza 'text/plain;charset=utf-8' para evitar problemas de CORS (CORS preflight / OPTIONS) en el navegador.
        // Google Apps Script lo recibe de igual manera en e.postData.contents y se puede parsear con JSON.parse.
        const response = await fetch('https://script.google.com/macros/s/AKfycbxZm4kBVRMvwHghLZ6-70gs2Gn3YinxbLcblZJXyWdzCVy4VarC9QUBSMYeVCJgoljd0w/exec', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          }
        });

        if (response.ok) {
          success = true;
        } else {
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      } catch (err) {
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }

    setIsSubmitting(false);
    if (success) {
      setIsSuccess(true);
    } else {
      setIsSubmitError(true);
    }
  };

  // Progression math
  const progressPercent = Math.min((step / 6) * 100, 100);

  // Dynamic formatted values
  const fmt = (val: number) => val.toLocaleString('es-ES');

  return (
    <div ref={containerRef} id="calculadora" className="relative bg-transparent">
      <div className="max-w-7xl mx-auto relative z-10 text-niu-text">
        
        {/* WIZARD CONTAINER */}
        <div className="w-full print:hidden">
          
          <div className="p-0">
            <AnimatePresence mode="wait">
              
              {/* SUCCESS VIEW */}
              {isSuccess ? (
                <motion.div 
                  key="success-screen"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-4"
                >
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-200">
                    <Check className="w-10 h-10 text-niu-main stroke-[3px]" />
                  </div>
                  <h3 className="font-display text-3xl font-extrabold text-niu-dark mb-3">
                    {formData.projectType === 'cohousing' ? '¡Solicitud Recibida!' : '¡Presupuesto Estimado Listo!'}
                  </h3>
                  <p className="text-gray-500 max-w-lg mx-auto mb-10 font-light text-sm sm:text-base leading-relaxed">
                    {formData.projectType === 'cohousing'
                      ? 'Hemos recibido correctamente tus datos de contacto para el proyecto de cohousing. Un asesor técnico se pondrá en contacto contigo a la brevedad. Mientras tanto, puedes agendar tu sesión a continuación.'
                      : 'Hemos recibido correctamente tus datos de proyecto. A continuación tienes el desglose preliminar de tu inversión sostenible. Un asesor técnico se pondrá en contacto contigo a la brevedad.'}
                  </p>

                  {/* ITEM-BY-ITEM DETAILED OUTCOME SUMMARY CARD */}
                  {formData.projectType !== 'cohousing' && (
                    <div className="bg-stone-50/55 border border-stone-150 rounded-sm p-6 sm:p-8 max-w-2xl mx-auto mb-10 text-left">
                      <h4 className="font-display font-bold text-niu-dark border-b border-stone-200 pb-3 mb-5 uppercase text-[11px] tracking-widest flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-niu-main" /> DESGLOSE DETALLADO DE INVERSIÓN
                      </h4>
                      
                      <div className="space-y-4 text-sm text-gray-700 font-sans">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-semibold block text-stone-800">Estructura y Acabados de Alta Eficiencia</span>
                            <span className="text-xs text-stone-400 font-light block">{formData.houseM2} m² construidos distribuidos en {formData.floors} {formData.floors === 1 ? 'planta' : 'plantas'}</span>
                          </div>
                          <span className="font-bold text-niu-dark shrink-0">{fmt(costBreakdown.structureCost)} €</span>
                        </div>

                        {/* Detailed Opcionales List */}
                        {(formData.fencing || formData.porch || formData.landscaping || formData.pool || formData.waterRecycling || formData.waterFiltration || formData.solarPanels) && (
                          <div className="border-t border-stone-100 pt-4 space-y-4">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">OPCIONALES Y AÑADIDOS SOLICITADOS (No incluidos en base)</span>
                            
                            <div className="space-y-3">
                              {formData.fencing && (
                                <div className="flex justify-between items-start text-xs pl-3 border-l-2 border-stone-250">
                                  <div>
                                    <span className="font-semibold text-stone-850 block">Cerramiento y valla perimetral</span>
                                    <span className="text-[11px] text-stone-400 font-light block">Cálculo lineal estimado: ~{costBreakdown.estimatedPerimeter} m de valla para parcela de {formData.plotM2} m² (a 200 €/m)</span>
                                  </div>
                                  <span className="font-mono text-stone-500 font-medium shrink-0 italic pr-1">~{fmt(costBreakdown.fencingCost)} €</span>
                                </div>
                              )}

                              {formData.porch && (
                                <div className="flex justify-between items-start text-xs pl-3 border-l-2 border-stone-250">
                                  <div>
                                    <span className="font-semibold text-stone-850 block">Porche de madera bioclimático</span>
                                    <span className="text-[11px] text-stone-400 font-light block">Superficie de porche elegida: {porchM2} m² (a 300 €/m²)</span>
                                  </div>
                                  <span className="font-mono text-stone-500 font-medium shrink-0 italic pr-1">~{fmt(costBreakdown.porchCost)} €</span>
                                </div>
                              )}

                              {formData.landscaping && (
                                <div className="flex justify-between items-start text-xs pl-3 border-l-2 border-stone-250">
                                  <div>
                                    <span className="font-semibold text-stone-850 block">Proyecto de Paisajismo y Jardín</span>
                                    <span className="text-[11px] text-stone-400 font-light block">Área de adecuación configurada: {costBreakdown.landscapingArea} m² (a 50 €/m²)</span>
                                  </div>
                                  <span className="font-mono text-stone-500 font-medium shrink-0 italic pr-1">~{fmt(costBreakdown.landscapingCost)} €</span>
                                </div>
                              )}

                              {formData.pool && (
                                <div className="flex justify-between items-start text-xs pl-3 border-l-2 border-stone-250">
                                  <div>
                                    <span className="font-semibold text-stone-850 block">Piscina integrada de diseño</span>
                                    <span className="text-[11px] text-stone-400 font-light block">Lámina de agua elegida: {poolM2} m² con profundidad de 1,5m (a 1.100 €/m²)</span>
                                  </div>
                                  <span className="font-mono text-stone-500 font-medium shrink-0 italic pr-1">~{fmt(costBreakdown.poolCost)} €</span>
                                </div>
                              )}

                              {formData.waterRecycling && (
                                <div className="flex justify-between items-start text-xs pl-3 border-l-2 border-stone-250">
                                  <div>
                                    <span className="font-semibold text-stone-850 block">Reaprovechamiento de aguas grises</span>
                                    <span className="text-[11px] text-stone-400 font-light block">Instalación técnica de filtración para riego ecológico</span>
                                  </div>
                                  <span className="font-mono text-stone-500 font-medium shrink-0 italic pr-1">~{fmt(costBreakdown.recyclingCost)} €</span>
                                </div>
                              )}

                              {formData.waterFiltration && (
                                <div className="flex justify-between items-start text-xs pl-3 border-l-2 border-stone-250">
                                  <div>
                                    <span className="font-semibold text-stone-850 block">Sistema central purificado agua potable</span>
                                    <span className="text-[11px] text-stone-400 font-light block">Filtro de carbón activo y saneamiento microbiológico UV</span>
                                  </div>
                                  <span className="font-mono text-stone-500 font-medium shrink-0 italic pr-1">~{fmt(costBreakdown.filtrationCost)} €</span>
                                </div>
                              )}

                              {formData.solarPanels && (
                                <div className="flex justify-between items-start text-xs pl-3 border-l-2 border-stone-250">
                                  <div>
                                    <span className="font-semibold text-stone-850 block">Placas solares fotovoltaicas</span>
                                    <span className="text-[11px] text-stone-400 font-light block">Suministro e instalación de autoconsumo energético</span>
                                  </div>
                                  <span className="font-mono text-stone-500 font-medium shrink-0 italic pr-1">~{fmt(costBreakdown.solarCost)} €</span>
                                </div>
                              )}
                            </div>

                            <div className="bg-stone-50 text-[11px] text-stone-400 border border-stone-205 p-3 leading-relaxed italic font-light rounded">
                              * Aclaración de Presupuesto: Las cantidades indicadas arriba son valores orientativos de mercado estimados de manera proporcional a las dimensiones especificadas. NO están incluidas en el precio total base, y serán valoradas de forma totalmente independiente mediante presupuestos personalizados por nuestro equipo técnico según el estudio topográfico definitivo y normativa local.
                            </div>
                          </div>
                        )}

                        {/* Features preselected */}
                        <div className="border-t border-stone-100 pt-3 flex justify-between items-start gap-4">
                          <div>
                            <span className="font-semibold block text-stone-800">Sistemas de Salud Estándar</span>
                            <span className="text-xs text-stone-400 font-light block">Aislamiento de madera biológica (Cert. A/A+), Aerotermia avanzada por conductos aire-agua.</span>
                          </div>
                          <span className="font-bold text-stone-500 uppercase text-[10px] bg-stone-150 px-2 py-0.5 rounded shrink-0 self-center">Incluido</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-5 border-t border-stone-200 text-base sm:text-lg text-niu-main font-bold">
                          <span className="uppercase tracking-wider text-[11px] font-extrabold text-stone-500">TOTAL BASE ESTÁNDAR (Sin IVA):</span>
                          <span className="text-2xl text-niu-dark">{fmt(costBreakdown.total)} €</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking widget integration callout */}
                  <div className="bg-stone-50 p-6 sm:p-8 rounded-sm border border-stone-200/60 max-w-2xl mx-auto">
                    {bookedEvent ? (
                      <div className="space-y-5 text-center py-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 animate-bounce">
                          <Check className="w-8 h-8 text-emerald-600 stroke-[3px]" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-display font-extrabold text-2xl text-niu-dark">
                            ¡Sesión Agendada con Éxito!
                          </h4>
                          <p className="text-gray-600 text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto">
                            Estupendo, <strong>{userDetails.nombre}</strong>. Tu cita ha quedado reservada correctamente en nuestro calendario. Hemos enviado un correo electrónico de confirmación con el enlace de acceso a <strong>{userDetails.email}</strong>.
                          </p>
                        </div>
                        <p className="text-gray-400 text-[11px] font-light max-w-sm mx-auto leading-relaxed">
                          Nuestro equipo técnico de arquitectura ya dispone de toda la configuración y opciones de extras seleccionadas para tu proyecto. ¡Estamos encantados de hablar contigo!
                        </p>
                        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <button 
                            type="button"
                            onClick={handleDownloadDossier}
                            className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Descargar Resumen (PDF)</span>
                          </button>
                          {activeCalendlyUrl && (
                            <button 
                              type="button"
                              onClick={() => {
                                setActiveCalendlyUrl(null);
                                setBookedEvent(false);
                              }}
                              className="text-xs text-stone-400 hover:text-niu-main transition-colors font-medium cursor-pointer"
                            >
                              Volver a ver calendario
                            </button>
                          )}
                        </div>
                      </div>
                    ) : activeCalendlyUrl ? (
                      <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center border-b border-stone-150 pb-3">
                          <h4 className="font-display font-bold text-sm sm:text-base text-niu-dark flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-niu-main animate-pulse" /> Reserva tu cita en el calendario
                          </h4>
                          <button 
                            type="button"
                            onClick={() => setActiveCalendlyUrl(null)}
                            className="text-xs text-stone-400 hover:text-niu-main transition-colors font-medium flex items-center gap-1 cursor-pointer"
                          >
                            ✕ Cancelar y Volver
                          </button>
                        </div>
                        <div className="relative bg-white border border-stone-200 rounded overflow-hidden shadow-inner h-[800px] w-full">
                          <iframe 
                            src={activeCalendlyUrl} 
                            width="100%" 
                            height="100%" 
                            frameBorder="0"
                            className="w-full h-full border-0"
                            title="Calendly Scheduling"
                          ></iframe>
                        </div>
                      </div>
                    ) : (
                      <>
                        {userDetails.tipoContacto === 'phone' && (
                          <div className="space-y-4">
                            <h4 className="font-display font-extrabold text-lg text-niu-dark mb-2 flex items-center justify-center gap-1.5">
                              <Phone className="w-4 h-4 text-niu-main" /> ¿Cuándo te iría bien que te llamásemos?
                            </h4>
                            <p className="text-gray-500 mb-6 text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto">
                              Selecciona un día y hora para que nuestro equipo te haga la llamada de teléfono.
                            </p>
                            <button 
                              type="button"
                              onClick={() => handleInitiateBooking("https://calendly.com/niuproject/llamada-telefonica-de-15-minutos")} 
                              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Phone className="w-4 h-4" />
                              <span>Agendar tu llamada</span>
                            </button>
                          </div>
                        )}

                        {userDetails.tipoContacto === 'presencial' && (
                          <div className="space-y-4">
                            <h4 className="font-display font-extrabold text-lg text-niu-dark mb-2 flex items-center justify-center gap-1.5">
                              <MapPin className="w-4 h-4 text-niu-main" /> ¿Cuándo te iría bien pasarte por nuestro estudio?
                            </h4>
                            <p className="text-gray-500 mb-6 text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto">
                              Selecciona un día y hora para podernos conocer personalmente y para que hablemos de tu Nido.
                            </p>
                            <button 
                              type="button"
                              onClick={() => handleInitiateBooking("https://calendly.com/niuproject/reunion-presencial-despacho")} 
                              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>Agendar tu visita</span>
                            </button>
                          </div>
                        )}

                        {userDetails.tipoContacto === 'videocall' && (
                          <div className="space-y-4">
                            <h4 className="font-display font-extrabold text-lg text-niu-dark mb-2 flex items-center justify-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-niu-main" /> ¿Agendamos una consultoría técnica gratuita?
                            </h4>
                            <p className="text-gray-500 mb-6 text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto">
                              Reserva una videollamada corta de 15 minutos en nuestro calendario para conversar sobre normativas, plazos, cimentación o resolver dudas directamente con nuestro equipo de arquitectura.
                            </p>
                            <button 
                              type="button"
                              onClick={() => handleInitiateBooking("https://calendly.com/niuproject/30min")} 
                              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Calendar className="w-4 h-4" />
                              <span>Agendar Sesión Online</span>
                            </button>
                          </div>
                        )}

                        {userDetails.tipoContacto === 'email' && (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-display font-extrabold text-lg text-niu-dark mb-2 flex items-center justify-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-niu-main" /> ¿Agendamos una consultoría técnica gratuita?
                              </h4>
                              <p className="text-gray-500 text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto">
                                Reserva una videollamada corta de 15 minutos en nuestro calendario para conversar sobre normativas, plazos, cimentación o resolver dudas directamente con nuestro equipo de arquitectura.
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                              <button 
                                type="button"
                                onClick={() => handleInitiateBooking("https://calendly.com/niuproject/30min")} 
                                className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Calendar className="w-4 h-4" />
                                <span>Agendar Sesión Online</span>
                              </button>

                              <button 
                                type="button"
                                onClick={handleDownloadDossier}
                                className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer hover:border-niu-hover hover:text-niu-hover transition-all duration-300"
                              >
                                <FileText className="w-4 h-4" />
                                <span>Descargar Resumen (PDF)</span>
                              </button>
                            </div>

                            {dossierDownloaded && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                              >
                                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-center text-xs font-light max-w-md mx-auto leading-relaxed">
                                  <strong>✓ Dossier de inversión generado:</strong> Se ha abierto el menú de impresión de tu navegador para guardar como PDF. También hemos enviado el estudio completo a tu correo de contacto de forma automática.
                                </div>
                                <div className="p-4 bg-amber-50/60 border border-amber-200/70 text-amber-950 rounded text-left text-xs font-light max-w-md mx-auto leading-relaxed">
                                  <p className="font-semibold mb-1 text-amber-950">Aclaración sobre la Estimación Preliminar:</p>
                                  <p className="text-amber-800 leading-normal">
                                    Las cantidades indicadas en el estudio son valores aproximados de mercado y de carácter puramente orientativo. 
                                    Existen múltiples partidas indispensables excluidas de esta estimación base (como cimentación especial, movimientos de tierra, estudios geotécnicos/topográficos, tasas locales y licencias de obra). 
                                    Este documento resumen no es contractual ni vinculante, y no compromete en ningún caso a NIU Project a realizar trabajos por dicho presupuesto preliminar.
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                 </motion.div>
              ) : (
                
                /* MULTI STEP WIZARD FORM */
                <div className="focus-trap">
                  
                  {/* STEP TITLE AND SUBTITLE (Moved to top) */}
                  <div className="space-y-1 mb-6 text-left">
                    <h3 className="font-display text-2xl font-bold text-niu-dark inline-flex items-center gap-2">
                      {getStepHeader().icon} {getStepHeader().title}
                    </h3>
                    <p className="text-sm font-light text-gray-500">
                      {getStepHeader().subtitle}
                    </p>
                  </div>

                  {/* STEPPER HEADING AND PROGRESS BAR (Swapped below Title) */}
                  <div className="space-y-3 mb-8 text-left">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-400">
                      <span>Paso {step} de 6</span>
                      <span className="text-niu-main">
                        {getStepHeader().stepName}
                      </span>
                    </div>
                    {/* PROGRESS BAR DIVIDER */}
                    <div className="w-full bg-stone-100 h-1.5 overflow-hidden rounded-full">
                      <div 
                        className="bg-niu-main h-full transition-all duration-500 ease-out" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* STEP SWITCHBOARD */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 text-left"
                    >


                      {/* 3 LEVEL CHOICES */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Option 1: Vivienda unifamiliar */}
                        <div 
                          onClick={() => {
                            setFormData(prev => ({ ...prev, projectType: 'unifamiliar' }));
                            setErrors(null);
                          }}
                          className={`option-card flex flex-col justify-between p-6 cursor-pointer border rounded ${formData.projectType === 'unifamiliar' ? 'active-selection border-niu-main bg-stone-50/40' : 'border-stone-150 hover:border-stone-250 bg-white'}`}
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Home className={`w-8 h-8 ${formData.projectType === 'unifamiliar' ? 'text-niu-main' : 'text-gray-350'}`} />
                              {formData.projectType === 'unifamiliar' && <Check className="text-niu-main w-5 h-5" />}
                            </div>
                            <h4 className="font-display font-bold text-lg text-stone-850">Vivienda Unifamiliar</h4>
                            <p className="text-xs text-stone-450 font-light leading-relaxed">
                              Vivienda independiente construida de forma eficiente con materiales respetuosos con el medio ambiente y sobre un terreno o parcela de tu propiedad. Totalmente flexible y personalizable.
                            </p>
                          </div>
                          <div className="pt-4 border-t border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-4">
                            Requiere Terreno
                          </div>
                        </div>

                        {/* Option 2: Cohousing */}
                        <div 
                          onClick={() => {
                            setFormData(prev => ({ ...prev, projectType: 'cohousing' }));
                            setErrors(null);
                          }}
                          className={`option-card flex flex-col justify-between p-6 cursor-pointer border rounded ${formData.projectType === 'cohousing' ? 'active-selection border-niu-main bg-stone-50/40' : 'border-stone-150 hover:border-stone-250 bg-white'}`}
                        >
                          <div className="space-y-4 font-sans">
                            <div className="flex justify-between items-center">
                              <Trees className={`w-8 h-8 ${formData.projectType === 'cohousing' ? 'text-niu-main' : 'text-gray-350'}`} />
                              {formData.projectType === 'cohousing' && <Check className="text-niu-main w-5 h-5" />}
                            </div>
                            <h4 className="font-display font-bold text-lg text-stone-850">Cohousing y Comunidades</h4>
                            <p className="text-xs text-stone-450 font-light leading-relaxed">
                              Proyectos colaborativos para colectivos con espacios privados y zonas comunitarias donde prima la alta eficiencia térmica y respeto al medioambiente en un entorno social y respetuoso.
                            </p>
                          </div>
                          <div className="pt-4 border-t border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-4">
                            Comunidad de Propietarios
                          </div>
                        </div>

                        {/* Option 3: Remontas */}
                        <div 
                          onClick={() => {
                            setFormData(prev => ({ ...prev, projectType: 'remontas', floors: Math.min(prev.floors || 1, 3) }));
                            setErrors(null);
                          }}
                          className={`option-card flex flex-col justify-between p-6 cursor-pointer border rounded ${formData.projectType === 'remontas' ? 'active-selection border-niu-main bg-stone-50/40' : 'border-stone-150 hover:border-stone-250 bg-white'}`}
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Layers className={`w-8 h-8 ${formData.projectType === 'remontas' ? 'text-niu-main' : 'text-gray-350'}`} />
                              {formData.projectType === 'remontas' && <Check className="text-niu-main w-5 h-5" />}
                            </div>
                            <h4 className="font-display font-bold text-lg text-stone-850">Remontas Urbanas</h4>
                            <p className="text-xs text-stone-450 font-light leading-relaxed">
                              Ampliación en altura sobre un edificio urbano existente. Aprovecha la edificabilidad total o parcial que permite el ayuntamiento en dicha parcela urbana, limitando el peso y optimizando plazos (máx. 2-3 plantas).
                            </p>
                          </div>
                          <div className="pt-4 border-t border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-4">
                            Suelo Urbano consolidado
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 text-left"
                    >


                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Provincia de la Parcela */}
                          <div className="space-y-2">
                            <label className="block text-stone-400 text-[10px] font-bold uppercase tracking-[0.18em]">
                              Provincia del proyecto *
                            </label>
                            <select 
                              value={formData.plotProvince}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, plotProvince: e.target.value }));
                                setErrors(null);
                              }}
                              className="calc-input border-l-4 border-l-niu-main bg-white"
                              required
                            >
                              {PROVINCES.map((prov) => (
                                <option key={prov} value={prov}>
                                  {prov}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Ubicación del Terreno (Ciudad/Población) */}
                          <div className="space-y-2">
                            <label className="block text-stone-400 text-[10px] font-bold uppercase tracking-[0.18em]">
                              Población o Ciudad *
                            </label>
                            <input 
                              type="text" 
                              value={formData.plotLocation}
                              onChange={(e) => setFormData(prev => ({ ...prev, plotLocation: e.target.value }))}
                              className="calc-input border-l-4 border-l-niu-main"
                              placeholder="Ej: La Garriga, San Cugat, Pozuelo..."
                              required
                            />
                          </div>

                          {/* Superficie del terreno / Huella */}
                          <div className="space-y-2">
                            <label className="block text-stone-400 text-[10px] font-bold uppercase tracking-[0.18em]">
                              {formData.projectType === 'remontas' 
                                ? "Huella en planta del edificio de partida (m²) *" 
                                : "Superficie de tu parcela (m²) *"}
                            </label>
                            <div className="relative">
                              <input 
                                type="number" 
                                value={formData.plotM2 || ''}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setFormData(prev => ({ ...prev, plotM2: val }));
                                  setErrors(null);
                                }}
                                className="calc-input border-l-4 border-l-niu-main pr-16 text-xl"
                                placeholder="Ej: 500" 
                                min="1"
                                required
                              />
                              <span className="absolute right-4 top-4 text-gray-400 font-light text-xs select-none">
                                {formData.projectType === 'remontas' ? "m² de huella" : "m² solar"}
                              </span>
                            </div>
                          </div>

                          {/* Referencia Catastral */}
                          <div className="space-y-2">
                            <label className="block text-stone-400 text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-1.2">
                              <Search className="w-3 h-3 text-stone-350" /> Ref. Catastral (Recomendada, opcional)
                            </label>
                            <input 
                              type="text" 
                              value={formData.cadastralRef}
                              onChange={(e) => setFormData(prev => ({ ...prev, cadastralRef: e.target.value }))}
                              className="calc-input text-xs"
                              placeholder="Ej: 9832601VK4793S0001PP"
                              maxLength={25}
                            />
                          </div>
                        </div>

                        {/* Informative text below the inputs */}
                        {formData.projectType === 'remontas' && (
                          <div className="p-4 bg-stone-50 border border-stone-200/50 rounded flex gap-3 items-start">
                            <Info className="w-4.5 h-4.5 text-niu-main shrink-0 mt-0.5" />
                            <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                              Para remontas, la estructura de madera aligera significativamente el peso total para evitar cargas excesivas en la cimentación existente.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 text-left"
                    >


                      <div className="space-y-6">
                        
                        {/* Metros Construidos Input */}
                        <div className="space-y-2">
                          <label className="block text-stone-400 text-[10px] font-bold uppercase tracking-[0.18em]">
                            Superficie Total Deseada (m² de Obra) *
                          </label>
                          <div className="relative max-w-md">
                            <input 
                              type="number" 
                              value={formData.houseM2 || ''}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setFormData(prev => ({ ...prev, houseM2: val }));
                                setErrors(null);
                              }}
                              className="calc-input h-24 text-3xl font-light text-stone-850 !pl-6 !pr-36 bg-[#fcfcfc]/80 border border-stone-200/90 rounded-sm focus:border-niu-main focus:ring-1 focus:ring-niu-main outline-none transition-all w-full"
                              placeholder="Ej: 120" 
                              min="30"
                              required
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-[10px] uppercase tracking-[0.15em] select-none">
                              m² construidos
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 pt-1">
                            {formData.projectType === 'remontas'
                              ? "Superficie total proyectada para la remonta en altura."
                              : "Superficie construida total. Combinando esto con la superficie original, se afinará el encaje normativo local."}
                          </p>
                        </div>

                        {/* COUNTERS INTERACTION */}
                        <div className="space-y-3 pt-2">
                          <label className="block text-stone-400 text-[10px] font-bold uppercase tracking-[0.18em]">
                            Distribución de Plantas y Estancias
                          </label>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            
                            {/* Floors (limited to 3 for remontas) */}
                            <div className="bg-stone-50/50 p-6 border border-stone-150 rounded-sm text-center">
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-4 flex items-center justify-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-stone-400" /> Plantas
                              </label>
                              <div className="flex items-center justify-center gap-4">
                                <button 
                                  type="button" 
                                  onClick={() => setFormData(p => ({ ...p, floors: Math.max(1, p.floors - 1) }))}
                                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-stone-400 hover:text-stone-700 text-stone-500 flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="text-2xl font-light text-stone-800 w-8">
                                  {formData.floors}
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setFormData(p => {
                                      const maxFloors = p.projectType === 'remontas' ? 3 : 5;
                                      return { ...p, floors: Math.min(maxFloors, p.floors + 1) };
                                    });
                                  }}
                                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-stone-400 hover:text-stone-700 text-stone-500 flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                              </div>
                              {formData.projectType === 'remontas' && (
                                <span className="text-[9px] text-amber-600 block mt-1 font-light leading-snug">
                                  Límite máx. 3 plantas
                                </span>
                              )}
                            </div>

                            {/* Rooms */}
                            <div className="bg-stone-50/50 p-6 border border-stone-150 rounded-sm text-center">
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-4 flex items-center justify-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-stone-400" /> Dormitorios
                              </label>
                              <div className="flex items-center justify-center gap-4">
                                <button 
                                  type="button" 
                                  onClick={() => setFormData(p => ({ ...p, rooms: Math.max(1, p.rooms - 1) }))}
                                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-stone-400 hover:text-stone-700 text-stone-500 flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="text-2xl font-light text-stone-800 w-8">
                                  {formData.rooms}
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => setFormData(p => ({ ...p, rooms: p.rooms + 1 }))}
                                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-stone-400 hover:text-stone-700 text-stone-500 flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Baths */}
                            <div className="bg-stone-50/50 p-6 border border-stone-150 rounded-sm text-center">
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-4 flex items-center justify-center gap-1">
                                <Bath className="w-3.5 h-3.5 text-stone-400" /> Baños
                              </label>
                              <div className="flex items-center justify-center gap-4">
                                <button 
                                  type="button" 
                                  onClick={() => setFormData(p => ({ ...p, baths: Math.max(1, p.baths - 1) }))}
                                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-stone-400 hover:text-stone-700 text-stone-500 flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="text-2xl font-light text-stone-800 w-8">
                                  {formData.baths}
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => setFormData(p => ({ ...p, baths: p.baths + 1 }))}
                                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-stone-400 hover:text-stone-700 text-stone-500 flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Workspaces */}
                            <div className="bg-stone-50/50 p-6 border border-stone-150 rounded-sm text-center">
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-4 flex items-center justify-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-stone-400" /> Despacho / Trabajo
                              </label>
                              <div className="flex items-center justify-center gap-4">
                                <button 
                                  type="button" 
                                  onClick={() => setFormData(p => ({ ...p, workspaces: Math.max(0, p.workspaces - 1) }))}
                                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-stone-400 hover:text-stone-700 text-stone-500 flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="text-2xl font-light text-stone-800 w-8">
                                  {formData.workspaces}
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => setFormData(p => ({ ...p, workspaces: p.workspaces + 1 }))}
                                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-stone-400 hover:text-stone-700 text-stone-500 flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                      <div className="bg-stone-50 p-4 border border-stone-150 rounded text-xs text-stone-500 font-light flex items-start gap-1.5 leading-relaxed">
                        <Info className="w-4 h-4 text-niu-main shrink-0 mt-0.5" />
                        <div>
                          <strong>Superficie Construida Estimada:</strong> Tu casa tendrá un total aproximado de{' '}
                          <strong className="text-stone-700 font-bold">{costBreakdown.builtinArea} m² construida</strong> en {formData.floors} {formData.floors === 1 ? 'planta' : 'plantas'}.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 text-left"
                    >


                      {/* EXTERIOR OPTION CARDS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Fencing */}
                        {formData.projectType !== 'remontas' && (
                          <div 
                            onClick={() => toggleField('fencing')}
                            className={`option-card flex items-center p-5 justify-between cursor-pointer ${formData.fencing ? 'active-selection border-niu-main bg-niu-main/5' : ''}`}
                          >
                            <div className="flex gap-4 items-center">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${formData.fencing ? 'bg-niu-main' : 'bg-stone-250'}`} />
                              <div>
                                <h4 className="font-display font-bold text-sm text-stone-850">Cerramiento de parcela</h4>
                                <p className="text-xs text-stone-400 font-light">Valla perimetral coordinada con fachadas</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-niu-main shrink-0">
                              {formData.fencing ? `Añadido (~${fmt(costBreakdown.fencingCost)} €)` : `~${fmt(Math.round(4 * Math.sqrt(formData.plotM2 || 500) * 200))} €`}
                            </span>
                          </div>
                        )}

                        {/* Porch */}
                        <div 
                          onClick={() => toggleField('porch')}
                          className={`option-card flex items-center p-5 justify-between cursor-pointer ${formData.porch ? 'active-selection border-niu-main bg-niu-main/5' : ''}`}
                        >
                          <div className="flex gap-4 items-center">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${formData.porch ? 'bg-niu-main' : 'bg-stone-250'}`} />
                            <div>
                              <h4 className="font-display font-bold text-sm text-stone-850">Porche exterior madera</h4>
                              <p className="text-xs text-stone-400 font-light">Sombreado bioclimático integrado ya amueblado</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-niu-main shrink-0">
                            {formData.porch ? `Añadido (~${fmt(costBreakdown.porchCost)} €)` : `~${fmt(porchM2 * 300)} €`}
                          </span>
                        </div>

                        {/* Landscaping */}
                        <div 
                          onClick={() => toggleField('landscaping')}
                          className={`option-card flex items-center p-5 justify-between cursor-pointer ${formData.landscaping ? 'active-selection border-niu-main bg-niu-main/5' : ''}`}
                        >
                          <div className="flex gap-4 items-center">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${formData.landscaping ? 'bg-niu-main' : 'bg-stone-250'}`} />
                            <div>
                              <h4 className="font-display font-bold text-sm text-stone-850">Proyecto de paisajismo</h4>
                              <p className="text-xs text-stone-404 font-light">Diseño de jardín ecológico integrado de bajo riego</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-niu-main shrink-0">
                            {formData.landscaping ? `Añadido (~${fmt(costBreakdown.landscapingCost)} €)` : `~${fmt(costBreakdown.landscapingArea * 50)} €`}
                          </span>
                        </div>

                        {/* Pool */}
                        {formData.projectType !== 'remontas' && (
                          <div 
                            onClick={() => toggleField('pool')}
                            className={`option-card flex items-center p-5 justify-between cursor-pointer ${formData.pool ? 'active-selection border-niu-main bg-niu-main/5' : ''}`}
                          >
                            <div className="flex gap-4 items-center">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${formData.pool ? 'bg-niu-main' : 'bg-stone-250'}`} />
                              <div>
                                <h4 className="font-display font-bold text-sm text-stone-850">Piscina integrada</h4>
                                <p className="text-xs text-stone-400 font-light font-sans">Lámina de agua y depuradora integrada eficiente</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-niu-main shrink-0">
                              {formData.pool ? `Añadido (~${fmt(costBreakdown.poolCost)} €)` : `~${fmt(poolM2 * 1100)} €`}
                            </span>
                          </div>
                        )}

                      </div>

                      {/* DYNAMIC SETTINGS FOR SELECTED EXTRAS */}
                      {(formData.fencing || formData.porch || formData.landscaping || formData.pool) && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-stone-50 border border-stone-200/80 rounded p-6 space-y-5"
                        >
                          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-niu-main" /> CONFIGURAR MEDIDAS DE EXTRAS (PRESUPUESTADO APARTE)
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Fence dynamic info */}
                            {formData.fencing && (
                              <div className="space-y-1.5 bg-white p-4 border border-stone-150 rounded">
                                <label className="block text-stone-800 font-bold text-xs">
                                  Cerramiento (Vallado Perimetral):
                                </label>
                                <p className="text-xs text-stone-500 font-light leading-relaxed">
                                  Establecido automáticamente para una parcela cuadrada de <strong className="text-stone-700">{formData.plotM2} m²</strong>. El perímetro resultante es de aprox. <strong className="text-stone-700">{costBreakdown.estimatedPerimeter} ml</strong> a 200 €/ml.
                                </p>
                                <div className="text-niu-main font-mono text-xs font-bold pt-1">
                                  Inversión ref.: ~{fmt(costBreakdown.fencingCost)} €
                                </div>
                              </div>
                            )}

                            {/* Porch dynamic slider */}
                            {formData.porch && (
                              <div className="space-y-1.5 bg-white p-4 border border-stone-150 rounded">
                                <div className="flex justify-between items-center">
                                  <label className="block text-stone-800 font-bold text-xs">
                                    Porche exterior (Madera):
                                  </label>
                                  <span className="font-mono text-xs font-bold text-niu-main bg-stone-100 px-2 py-0.5 rounded">
                                    {porchM2} m²
                                  </span>
                                </div>
                                <input 
                                  type="range" 
                                  min="5" 
                                  max="60" 
                                  value={porchM2} 
                                  onChange={(e) => setPorchM2(Number(e.target.value))}
                                  className="w-full h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-niu-main my-2"
                                />
                                <div className="flex justify-between text-[9px] text-stone-400 font-light">
                                  <span>Mín: 5 m²</span>
                                  <span>Base: 15 m² (4.500 €)</span>
                                  <span>Máx: 60 m² (a 300 €/m²)</span>
                                </div>
                                <div className="text-niu-main font-mono text-xs font-bold pt-1">
                                  Inversión ref.: ~{fmt(costBreakdown.porchCost)} €
                                </div>
                              </div>
                            )}

                            {/* Landscaping dynamic slider */}
                            {formData.landscaping && (
                              <div className="space-y-1.5 bg-white p-4 border border-stone-150 rounded">
                                <div className="flex justify-between items-center">
                                  <label className="block text-stone-800 font-bold text-xs">
                                    Proyecto de Paisajismo:
                                  </label>
                                  <span className="font-mono text-xs font-bold text-niu-main bg-stone-100 px-2 py-0.5 rounded">
                                    {costBreakdown.landscapingArea} m²
                                  </span>
                                </div>
                                <input 
                                  type="range" 
                                  min="10" 
                                  max={Math.max(200, formData.plotM2)} 
                                  value={costBreakdown.landscapingArea} 
                                  onChange={(e) => setCustomLandscapingM2(Number(e.target.value))}
                                  className="w-full h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-niu-main my-2"
                                />
                                <div className="flex justify-between text-[9px] text-stone-400 font-light">
                                  <span>Mín: 10 m²</span>
                                  <span>Por defecto: {costBreakdown.defaultGardenArea} m² (Jardín libre)</span>
                                  <span>Máx: {Math.max(200, formData.plotM2)} m² (a 50 €/m²)</span>
                                </div>
                                <div className="text-niu-main font-mono text-xs font-bold pt-1">
                                  Inversión ref.: ~{fmt(costBreakdown.landscapingCost)} €
                                </div>
                              </div>
                            )}

                            {/* Pool dynamic slider */}
                            {formData.pool && (
                              <div className="space-y-1.5 bg-white p-4 border border-stone-150 rounded">
                                <div className="flex justify-between items-center">
                                  <label className="block text-stone-800 font-bold text-xs">
                                    Piscina Integrada (S. Lámina):
                                  </label>
                                  <span className="font-mono text-xs font-bold text-niu-main bg-stone-100 px-2 py-0.5 rounded">
                                    {poolM2} m² (med. med. {poolM2 === 18 ? '6x3m' : `${Math.round(poolM2/3)}x3m`})
                                  </span>
                                </div>
                                <input 
                                  type="range" 
                                  min="8" 
                                  max="50" 
                                  value={poolM2} 
                                  onChange={(e) => setPoolM2(Number(e.target.value))}
                                  className="w-full h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-niu-main my-2"
                                />
                                <div className="flex justify-between text-[9px] text-stone-400 font-light">
                                  <span>Mín: 8 m²</span>
                                  <span>Base: 18 m² (19.800 €)</span>
                                  <span>Máx: 50 m² (a 1.100 €/m²)</span>
                                </div>
                                <div className="text-niu-main font-mono text-xs font-bold pt-1">
                                  Inversión ref.: ~{fmt(costBreakdown.poolCost)} €
                                </div>
                              </div>
                            )}

                          </div>
                          <p className="text-[10px] text-stone-400 italic leading-tight">
                            * Nota: Todos los precios reflejados en este recuadro corresponden a valores de referencia orientativos calculados por metro cuadrado o lineal de acuerdo a especificaciones reales recopiladas. Quedarán expresamente fuera del total base de la vivienda estándar.
                          </p>
                        </motion.div>
                      )}

                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 text-left"
                    >


                      {/* INCLUDED PREMIUM STANDARDS */}
                      <div className="bg-stone-50 border border-stone-200 rounded p-5 space-y-4">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block border-b border-stone-200 pb-2">EQUIPAMIENTOS ECO-ESTÁNDAR INCLUIDOS</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Standard 1: Insulation */}
                          <div className="flex gap-3 items-start">
                            <div className="p-1 px-1.5 bg-niu-main/10 rounded-full text-niu-main text-xs font-extrabold mt-0.5">✓</div>
                            <div>
                              <span className="font-display font-bold text-sm text-stone-800">Aislamiento Eficiencia A / A+</span>
                              <span className="text-xs text-stone-500 font-light block">Estructura de fibra de madera biológica certificada y envolvente térmica integral libre de puentes térmicos.</span>
                            </div>
                          </div>

                          {/* Standard 2: Aerotermia */}
                          <div className="flex gap-3 items-start">
                            <div className="p-1 px-1.5 bg-niu-main/10 rounded-full text-niu-main text-xs font-extrabold mt-0.5">✓</div>
                            <div>
                              <span className="font-display font-bold text-sm text-stone-800">Climatización de Aerotermia por Conductos</span>
                              <span className="text-xs text-stone-500 font-light block">Sistema integral de producción de agua caliente y climatización eco-inteligente de altísimo rendimiento.</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* OPTIONAL SUSTAINABILITY EXTRAS */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">OPCIONALES DE AUTOPRODUCCIÓN Y SALUD</span>
                        
                        <div className="space-y-3">
                          {/* Rainwater recycling */}
                          {formData.projectType !== 'remontas' && (
                            <label className="flex items-center justify-between p-4 bg-white hover:bg-stone-50/50 border border-stone-150 rounded cursor-pointer group transition-colors">
                              <div className="flex items-start gap-4">
                                <input 
                                  type="checkbox" 
                                  checked={formData.waterRecycling}
                                  onChange={() => toggleField('waterRecycling')}
                                  className="peer sr-only"
                                />
                                <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-niu-main relative shrink-0"></div>
                                <div>
                                  <span className="font-display font-bold text-sm text-stone-800 flex items-center gap-1"><Droplet className="w-4 h-4 text-niu-main" /> Reaprovechamiento integral de agua de lluvia</span>
                                  <span className="text-xs text-stone-450 font-light block leading-normal">Tanque enterrado con filtros bioclimáticos de filtración y bombeo para riego y cisterna.</span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-stone-500 shrink-0 select-none group-hover:text-niu-main pl-4">
                                {formData.waterRecycling ? 'Añadido (Presupuestar aparte)' : '+4.800 €'}
                              </span>
                            </label>
                          )}

                          {/* Filtered safe water */}
                          <label className="flex items-center justify-between p-4 bg-white hover:bg-stone-50/50 border border-stone-150 rounded cursor-pointer group transition-colors">
                            <div className="flex items-start gap-4">
                              <input 
                                type="checkbox" 
                                checked={formData.waterFiltration}
                                onChange={() => toggleField('waterFiltration')}
                                className="peer sr-only"
                              />
                              <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-niu-main relative shrink-0"></div>
                              <div>
                                <span className="font-display font-bold text-sm text-stone-800 flex items-center gap-1"><Sparkles className="w-4 h-4 text-niu-main" /> Agua potable ultra-saludable</span>
                                <span className="text-xs text-stone-450 font-light block leading-normal">Sistema central por filtrado de carbón activado magnético libre de microplásticos y olores.</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-stone-500 shrink-0 select-none group-hover:text-niu-main pl-4">
                              {formData.waterFiltration ? 'Añadido (Presupuestar aparte)' : '+5.500 €'}
                            </span>
                          </label>

                          {/* Solar energy */}
                          <label className="flex items-center justify-between p-4 bg-white hover:bg-stone-50/50 border border-stone-150 rounded cursor-pointer group transition-colors">
                            <div className="flex items-start gap-4">
                              <input 
                                type="checkbox" 
                                checked={formData.solarPanels}
                                onChange={() => toggleField('solarPanels')}
                                className="peer sr-only"
                              />
                              <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-niu-main relative shrink-0"></div>
                              <div>
                                <span className="font-display font-bold text-sm text-stone-800 flex items-center gap-1"><Zap className="w-4 h-4 text-niu-main" /> Kit solar fotovoltaico de autoconsumo</span>
                                <span className="text-xs text-stone-450 font-light block leading-normal">Solución completa autogestionada: 12 módulos fotovoltaicos de 450W (5,4kWp), inversor/cargador Victron MultiPlus II 5kW, 4 baterías monobloc de litio de 2.76kWh, regulador MPPT y material de protección.</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-stone-500 shrink-0 select-none group-hover:text-niu-main pl-4">
                              {formData.solarPanels ? 'Añadido (Presupuestar aparte)' : '+14.400 €'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 6 && (
                    <motion.div
                      key="step6"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-10 text-left"
                    >
                      {/* REAL-TIME PREVIEW BADGE */}
                      {formData.projectType !== 'cohousing' && (
                        <div className="bg-niu-main text-white p-8 sm:p-10 text-center rounded-sm shadow-md relative overflow-hidden">
                          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.22em] mb-3">
                            ESTIMACIÓN PRELIMINAR DE OBRA
                          </p>
                          <div className="flex justify-center items-start gap-1 mb-3">
                            <span className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight">
                              {fmt(costBreakdown.total)}
                            </span>
                            <span className="text-xl sm:text-2xl mt-1.5 font-light text-white/70">€</span>
                          </div>
                          <p className="text-[10px] text-white/50 max-w-lg mx-auto leading-relaxed border-t border-white/10 pt-4">
                            * Estimación orientativa de presupuesto de obra civil (sin IVA) para una superficie de edificación calculada de {costBreakdown.builtinArea} m². No se incluye costes de cimentación, impuestos ni el precio del solar.
                          </p>
                        </div>
                      )}

                      {/* Lead form section */}
                      <div className="space-y-6">


                        {/* INPUT FOR FIELDS */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <span className="absolute inset-y-0 left-4 flex items-center pr-3 pointer-events-none">
                                <User className="w-4 h-4 text-gray-300 animate-pulse" />
                              </span>
                              <input 
                                type="text" 
                                name="nombre"
                                value={userDetails.nombre}
                                onChange={handleUserDetailChange}
                                placeholder="Nombre completo *" 
                                className="calc-input calc-input-icon border-l-3 border-l-niu-main text-sm"
                                required
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-4 flex items-center pr-3 pointer-events-none">
                                <Phone className="w-4 h-4 text-gray-300" />
                              </span>
                              <input 
                                type="tel"
                                name="telefono"
                                value={userDetails.telefono}
                                onChange={handleUserDetailChange}
                                placeholder="Teléfono de contacto *" 
                                className="calc-input calc-input-icon border-l-3 border-l-niu-main text-sm"
                                required
                              />
                            </div>
                          </div>

                          <div className="relative">
                            <span className="absolute inset-y-0 left-4 flex items-center pr-3 pointer-events-none">
                              <Mail className="w-4 h-4 text-gray-300" />
                            </span>
                            <input 
                              type="email"
                              name="email"
                              value={userDetails.email}
                              onChange={handleUserDetailChange}
                              placeholder="Correo electrónico *" 
                              className="calc-input calc-input-icon border-l-3 border-l-niu-main text-sm"
                              required
                            />
                          </div>

                          {/* ¿Cómo prefieres que contactemos? Selection */}
                          <div className="space-y-3 pt-3">
                            <label className="block text-stone-500 text-[11px] font-bold uppercase tracking-[0.12em]">
                              ¿Cómo prefieres que realicemos tu primer estudio de viabilidad gratuito? *
                            </label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              
                              {/* Option 1: Videollamada */}
                              <div 
                                onClick={() => setUserDetails(prev => ({ ...prev, tipoContacto: 'videocall' }))}
                                className={`p-4 border rounded cursor-pointer transition-all flex flex-col justify-between ${userDetails.tipoContacto === 'videocall' ? 'border-niu-main bg-niu-main/5 ring-1 ring-niu-main' : 'border-stone-150 hover:border-stone-250 bg-white'}`}
                              >
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <Calendar className={`w-5 h-5 ${userDetails.tipoContacto === 'videocall' ? 'text-niu-main' : 'text-stone-400'}`} />
                                    {userDetails.tipoContacto === 'videocall' && <span className="w-2 h-2 rounded-full bg-niu-main"></span>}
                                  </div>
                                  <span className="font-display font-semibold text-xs text-stone-850 block">Videollamada</span>
                                  <span className="text-[10px] text-stone-450 font-light block leading-normal mt-1">Con nuestro arquitecto por Teams/Meet. (Recomendado)</span>
                                </div>
                                <span className="text-[9px] font-bold text-niu-main uppercase tracking-wider block mt-3 select-none">Prioritario</span>
                              </div>

                              {/* Option 2: Llamada */}
                              <div 
                                onClick={() => setUserDetails(prev => ({ ...prev, tipoContacto: 'phone' }))}
                                className={`p-4 border rounded cursor-pointer transition-all flex flex-col justify-between ${userDetails.tipoContacto === 'phone' ? 'border-niu-main bg-niu-main/5 ring-1 ring-niu-main' : 'border-stone-150 hover:border-stone-250 bg-white'}`}
                              >
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <Phone className={`w-5 h-5 ${userDetails.tipoContacto === 'phone' ? 'text-niu-main' : 'text-stone-400'}`} />
                                    {userDetails.tipoContacto === 'phone' && <span className="w-2 h-2 rounded-full bg-niu-main"></span>}
                                  </div>
                                  <span className="font-display font-semibold text-xs text-stone-850 block">Llamada Telefónica</span>
                                  <span className="text-[10px] text-stone-450 font-light block leading-normal mt-1">Te llamamos al móvil en tu horario de preferencia.</span>
                                </div>
                                <span className="text-[9px] font-medium text-stone-400 uppercase tracking-wider block mt-3 select-none">Contacto rápido</span>
                              </div>

                              {/* Option 3: Presencial */}
                              <div 
                                onClick={() => setUserDetails(prev => ({ ...prev, tipoContacto: 'presencial' }))}
                                className={`p-4 border rounded cursor-pointer transition-all flex flex-col justify-between ${userDetails.tipoContacto === 'presencial' ? 'border-niu-main bg-niu-main/5 ring-1 ring-niu-main' : 'border-stone-150 hover:border-stone-250 bg-white'}`}
                              >
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <MapPin className={`w-5 h-5 ${userDetails.tipoContacto === 'presencial' ? 'text-niu-main' : 'text-stone-400'}`} />
                                    {userDetails.tipoContacto === 'presencial' && <span className="w-2 h-2 rounded-full bg-niu-main"></span>}
                                  </div>
                                  <span className="font-display font-semibold text-xs text-stone-850 block">Reunión Presencial</span>
                                  <span className="text-[10px] text-stone-450 font-light block leading-normal mt-1">En nuestras oficinas en: Carrer Bonaire, La Garriga, Barcelona.</span>
                                </div>
                                <span className="text-[9px] font-medium text-stone-400 uppercase tracking-wider block mt-3 select-none">En Despacho</span>
                              </div>

                              {/* Option 4: Email */}
                              <div 
                                onClick={() => setUserDetails(prev => ({ ...prev, tipoContacto: 'email' }))}
                                className={`p-4 border rounded cursor-pointer transition-all flex flex-col justify-between ${userDetails.tipoContacto === 'email' ? 'border-niu-main bg-niu-main/5 ring-1 ring-niu-main' : 'border-stone-150 hover:border-stone-250 bg-white'}`}
                              >
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <Mail className={`w-5 h-5 ${userDetails.tipoContacto === 'email' ? 'text-niu-main' : 'text-stone-400'}`} />
                                    {userDetails.tipoContacto === 'email' && <span className="w-2 h-2 rounded-full bg-niu-main"></span>}
                                  </div>
                                  <span className="font-display font-semibold text-xs text-stone-850 block">Solo Email</span>
                                  <span className="text-[10px] text-stone-450 font-light block leading-normal mt-1">Si únicamente prefieres que te escribamos con el dossier PDF.</span>
                                </div>
                                <span className="text-[9px] font-medium text-stone-400 uppercase tracking-wider block mt-3 select-none">Dossier escrito</span>
                              </div>

                            </div>
                          </div>

                          <div className="relative">
                            <span className="absolute top-4 left-4 flex items-start pointer-events-none">
                              <FileText className="w-4 h-4 text-gray-300" />
                            </span>
                            <textarea 
                              name="detalles"
                              value={userDetails.detalles}
                              onChange={handleUserDetailChange}
                              rows={3}
                              placeholder="Cuéntanos más detalles sobre tu idea o dudas adicionales (ej: terreno en pendiente, fecha estimada, etc.)..." 
                              className="calc-input !pl-12 resize-none text-sm font-sans"
                            />
                          </div>
                        </div>

                        {isSubmitError && (
                          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-sm border border-red-100 font-medium">
                            Hubo un error al intentar tramitar la solicitud con Formspree. Por favor, revisa tu conexión a internet o reintenta en unos instantes.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* NAV CONTROLS AREA */}
                  <div className="flex flex-col items-end pt-6 mt-10 border-t border-stone-150 gap-3">
                    
                    {/* Compact warning messages */}
                    {errors && (
                      <div className="text-niu-error text-xs font-semibold flex items-center gap-1.5 bg-red-50/70 px-3.5 py-1.5 border border-red-100 rounded-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-niu-error animate-ping"></span>
                        {errors}
                      </div>
                    )}

                    <div className="flex gap-4 w-full justify-between items-center">
                      {step > 1 ? (
                        <button 
                          type="button" 
                          onClick={handleBack} 
                          className="btn-secondary py-3 px-6 text-[9px] sm:text-[10px]"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                          Atrás
                        </button>
                      ) : (
                        <div /> // spacer
                      )}

                      {step < 6 ? (
                        <button 
                          type="button" 
                          onClick={handleNext} 
                          className={`btn-primary py-3 px-8 text-[9px] sm:text-[10px] ${shakeButton ? 'shake' : ''}`}
                        >
                          Continuar
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      ) : (
                        <button 
                          type="submit" 
                          onClick={handleFormSubmit}
                          disabled={isSubmitting}
                          className={`btn-primary bg-niu-main hover:bg-niu-hover py-3 px-8 text-[9px] sm:text-[10px] min-w-[200px] sm:min-w-[240px] ${shakeButton ? 'shake' : ''} ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2 justify-center">
                              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Calculando...
                            </span>
                          ) : (
                            <>
                              <span>Solicitar Estudio Completo</span>
                              <Check className="w-3.5 h-3.5 ml-1.5 stroke-[3px]" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* PRINT-ONLY DOSSIER/SUMMARY TEMPLATE */}
        <div className="hidden print:block font-sans text-stone-900 bg-white p-8 max-w-4xl mx-auto space-y-8">
          {/* Header with Logo/Brand */}
          <div className="border-b-2 border-stone-800 pb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-stone-900">NIU PROJECT</h1>
              <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">Sistemas de Arquitectura Sostenible</p>
            </div>
            <div className="text-right text-[10px] text-stone-400 font-mono">
              <p>Estudio de Viabilidad Preliminar</p>
              <p>Fecha: {new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>

          {/* Client & Project Header */}
          <div className="grid grid-cols-2 gap-6 bg-stone-50 p-6 rounded-sm border border-stone-200">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Datos de Contacto</h3>
              <p className="text-sm font-medium"><strong className="font-semibold text-stone-600">Nombre:</strong> {userDetails.nombre || 'N/A'}</p>
              <p className="text-sm font-medium"><strong className="font-semibold text-stone-600">Teléfono:</strong> {userDetails.telefono || 'N/A'}</p>
              <p className="text-sm font-medium"><strong className="font-semibold text-stone-600">Email:</strong> {userDetails.email || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Especificaciones del Proyecto</h3>
              <p className="text-sm font-medium"><strong className="font-semibold text-stone-600">Tipo de Proyecto:</strong> {
                formData.projectType === 'cohousing' ? 'Cohousing y Comunidades' :
                formData.projectType === 'remontas' ? 'Remontas Urbanas' : 'Vivienda Unifamiliar'
              }</p>
              {formData.projectType !== 'cohousing' && (
                <>
                  <p className="text-sm font-medium"><strong className="font-semibold text-stone-600">Superficie Deseada:</strong> {formData.houseM2} m²</p>
                  <p className="text-sm font-medium"><strong className="font-semibold text-stone-600">Distribución:</strong> {formData.floors} {formData.floors === 1 ? 'planta' : 'plantas'}, {formData.rooms} dorm., {formData.baths} baños, {formData.workspaces} desp.</p>
                </>
              )}
            </div>
          </div>

          {/* Project Details / Choices list */}
          {formData.projectType !== 'cohousing' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-2">Configuración Seleccionada</h3>
              <div className="grid grid-cols-2 gap-4 text-xs text-stone-600">
                <p><strong>Ubicación:</strong> {formData.plotLocation || 'No especificada'} ({formData.plotProvince})</p>
                <p><strong>Superficie de parcela/huella:</strong> {formData.plotM2 ? `${formData.plotM2} m²` : 'N/A'}</p>
                <p><strong>Acabado interior/exterior:</strong> {formData.finish === 'premium' ? 'Premium (Alta eficiencia)' : 'Estándar'}</p>
                <div className="col-span-2">
                  <strong className="block text-stone-700 mb-1">Equipamiento y Extras:</strong>
                  <ul className="list-disc list-inside space-y-1 text-stone-500">
                    {formData.fencing && <li>Cerramiento de parcela y valla perimetral coordinada</li>}
                    {formData.porch && <li>Porche de madera bioclimático ({porchM2} m²)</li>}
                    {formData.landscaping && <li>Proyecto de Paisajismo y Adecuación de Jardín ({costBreakdown.landscapingArea} m²)</li>}
                    {formData.pool && <li>Piscina integrada de diseño eficiente ({poolM2} m²)</li>}
                    {formData.waterRecycling && <li>Reaprovechamiento integral de agua de lluvia (Filtros bioclimáticos)</li>}
                    {formData.waterFiltration && <li>Sistema central purificado de agua potable (Carbón activo y UV)</li>}
                    {formData.solarPanels && <li>Instalación de placas solares fotovoltaicas (Autoconsumo)</li>}
                    {!formData.fencing && !formData.porch && !formData.landscaping && !formData.pool && !formData.waterRecycling && !formData.waterFiltration && !formData.solarPanels && <li>Ningún extra opcional seleccionado</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Costs (Skip for Cohousing) */}
          {formData.projectType !== 'cohousing' && (
            <div className="space-y-4 bg-stone-50 p-6 rounded-sm border border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-2">Estimación Preliminar de Inversión</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Estructura y Acabados de Alta Eficiencia (Madera):</span>
                  <span className="font-bold">{fmt(costBreakdown.structureCost)} €</span>
                </div>
                
                {/* Extras list with prices */}
                {(formData.fencing || formData.porch || formData.landscaping || formData.pool || formData.waterRecycling || formData.waterFiltration || formData.solarPanels) && (
                  <div className="pt-2 border-t border-stone-200 space-y-1 text-stone-500">
                    {formData.fencing && (
                      <div className="flex justify-between">
                        <span>- Cerramiento de parcela (~{costBreakdown.estimatedPerimeter} m de valla):</span>
                        <span>~{fmt(costBreakdown.fencingCost)} €</span>
                      </div>
                    )}
                    {formData.porch && (
                      <div className="flex justify-between">
                        <span>- Porche de madera bioclimático ({porchM2} m²):</span>
                        <span>~{fmt(costBreakdown.porchCost)} €</span>
                      </div>
                    )}
                    {formData.landscaping && (
                      <div className="flex justify-between">
                        <span>- Proyecto de Paisajismo y Jardín ({costBreakdown.landscapingArea} m²):</span>
                        <span>~{fmt(costBreakdown.landscapingCost)} €</span>
                      </div>
                    )}
                    {formData.pool && (
                      <div className="flex justify-between">
                        <span>- Piscina integrada de diseño ({poolM2} m²):</span>
                        <span>~{fmt(costBreakdown.poolCost)} €</span>
                      </div>
                    )}
                    {formData.waterRecycling && (
                      <div className="flex justify-between">
                        <span>- Reaprovechamiento integral de agua de lluvia:</span>
                        <span>~{fmt(costBreakdown.recyclingCost)} €</span>
                      </div>
                    )}
                    {formData.waterFiltration && (
                      <div className="flex justify-between">
                        <span>- Sistema central purificado de agua potable:</span>
                        <span>~{fmt(costBreakdown.filtrationCost)} €</span>
                      </div>
                    )}
                    {formData.solarPanels && (
                      <div className="flex justify-between">
                        <span>- Placas solares fotovoltaicas (Instalación de autoconsumo):</span>
                        <span>~{fmt(costBreakdown.solarCost)} €</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-stone-900 pt-4 border-t-2 border-stone-300">
                  <span className="uppercase tracking-wider text-[11px] font-extrabold text-stone-500">TOTAL ESTIMADO BASE (Sin IVA):</span>
                  <span>{fmt(costBreakdown.total)} €</span>
                </div>
              </div>
            </div>
          )}

          {/* NON-BINDING DISCLAIMER */}
          <div className="border-t border-stone-350 pt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1">
              AVISO IMPORTANTE Y CLÁUSULA DE NO VINCULACIÓN
            </h4>
            <p className="text-[10px] text-stone-500 leading-relaxed text-justify">
              Se trata de un documento de resumen con valores orientativos aproximados basados en estimaciones genéricas de mercado de NIU Project. 
              Esta valoración preliminar se realiza de forma totalmente orientativa y proporcional a los m² de edificación configurados. 
              Existen múltiples partidas técnicas y administrativas que están expresamente excluidas de este cálculo (por ejemplo: estudio geotécnico y topográfico del terreno, tasas de licencias municipales, dirección técnica de obra, acometidas a servicios urbanos, excavaciones o cimentaciones especiales requeridas por la tipología del suelo, o IVA aplicable).
            </p>
            <p className="text-[10px] text-stone-500 leading-relaxed text-justify">
              Este documento de resumen no es vinculante, no constituye una oferta contractual y no compromete en ningún caso a NIU Project a realizar trabajos ni a proveer materiales por los precios o parámetros aquí reflejados. Los importes y calidades finales del proyecto quedarán sujetos única y exclusivamente al correspondiente estudio técnico detallado y al contrato de obra formalizado entre ambas partes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
