export const SUPPORTED_LOCALES = ['en', 'pt-BR'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  'en': 'English',
  'pt-BR': 'Português (Brasil)',
};

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_HEADER_NAME = 'x-locale';

export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}
