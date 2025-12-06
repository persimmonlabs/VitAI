export * from './config';
export { useTranslation, getTranslation } from './hooks/useTranslation';
export {
  getLocaleFromCookies,
  getLocaleFromHeaders,
  detectLocaleFromRequest,
  setLocaleCookie,
  getCurrentLocale,
} from './utils/locale';
