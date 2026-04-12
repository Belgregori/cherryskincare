import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

i18n
  // Detectar idioma del navegador
  .use(LanguageDetector)
  // Pasar la instancia de i18n a react-i18next
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    // Idioma por defecto
    fallbackLng: 'es',
    
    // Idiomas disponibles
    supportedLngs: ['es', 'en'],
    
    // Namespaces
    ns: ['common', 'auth', 'products', 'cart', 'checkout'],
    defaultNS: 'common',
    
    // Recursos de traducción
    resources: {
      es: {
        common: esTranslations.common || {},
        auth: esTranslations.auth || {},
        products: esTranslations.products || {},
        cart: esTranslations.cart || {},
        checkout: esTranslations.checkout || {},
      },
      en: {
        common: enTranslations.common || {},
        auth: enTranslations.auth || {},
        products: enTranslations.products || {},
        cart: enTranslations.cart || {},
        checkout: enTranslations.checkout || {},
      },
    },
    
    // Opciones de detección de idioma
    detection: {
      // Orden de detección
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Claves de caché
      caches: ['localStorage'],
      
      // Clave en localStorage
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Opciones de interpolación
    interpolation: {
      escapeValue: false, // React ya escapa valores
    },
    
    // Opciones de react-i18next
    react: {
      useSuspense: false, // No usar Suspense para evitar problemas
    },
    
    // Debug (solo en desarrollo)
    debug: import.meta.env.MODE === 'development',
  });

export default i18n;
