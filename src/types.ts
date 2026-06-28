export interface FormData {
  // Solución seleccionada
  projectType?: 'unifamiliar' | 'cohousing' | 'remontas' | '';

  // Terreno
  plotM2: number;
  plotLocation: string;
  plotProvince: string;
  cadastralRef: string;

  // Tamaño de la casa
  houseM2: number;

  // Distribución
  floors: number;
  rooms: number;
  baths: number;
  workspaces: number;

  // Exteriores
  fencing: boolean;
  porch: boolean;
  landscaping: boolean;
  pool: boolean;

  // Sostenibilidad
  waterRecycling: boolean;
  waterFiltration: boolean;
  solarPanels: boolean;

  // Acabados
  finish: 'basic' | 'premium' | 'extraordinary' | '';
}

export type Language = 'es' | 'ca';

export interface TranslationSet {
  nav_home: string;
  nav_essence: string;
  nav_calc: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  essence_title: string;
  essence_p1: string;
  essence_p2: string;
  essence_p3: string;
  essence_p4: string;
  sust_title: string;
  sust_1_title: string;
  sust_1_desc: string;
  sust_2_title: string;
  sust_2_desc: string;
  sust_3_title: string;
  sust_3_desc: string;
  calc_title: string;
  calc_subtitle: string;
  step_title_1: string;
  step_title_2: string;
  step_title_3: string;
  step_title_4: string;
  step_title_5: string;
  step_title_6: string;
  yes_plot: string;
  no_plot: string;
  label_m2: string;
  label_finish: string;
  opt_standard_title: string;
  opt_standard_desc: string;
  opt_premium_title: string;
  opt_premium_desc: string;
  vent_subtitle: string;
  vent_desc: string;
  label_add_vent: string;
  label_floors: string;
  label_rooms: string;
  label_baths: string;
  yes_garage: string;
  no_garage: string;
  result_title: string;
  result_disclaimer: string;
  contact_title: string;
  contact_desc: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  contact_loc: string;
  contact_details: string;
  btn_submit: string;
  btn_back: string;
  btn_continue: "Continuar";
  btn_see_results: "Ver Resultado";
  error_selection: string;
  error_data: string;
  success_title: string;
  success_desc: string;
  quote_breakdown: string;
  quote_structure: string;
  quote_vent: string;
  quote_garage: string;
  quote_total: string;
  book_title: string;
  book_desc: string;
  btn_book: string;
  btn_restart: string;
  faq_title: string;
  faq_1_q: string;
  faq_1_a: string;
  faq_2_q: string;
  faq_2_a: string;
  faq_3_q: string;
  faq_3_a: string;
  embed_help: string;
  embed_full: string;
  embed_widget: string;
}
