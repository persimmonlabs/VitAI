import { cookies, headers } from 'next/headers';
import { type NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale, isValidLocale } from '../config';

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME);

  if (localeCookie && isValidLocale(localeCookie.value)) {
    return localeCookie.value;
  }

  return DEFAULT_LOCALE;
}

export async function getLocaleFromHeaders(): Promise<Locale> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, quality] = lang.trim().split(';q=');
      return {
        code: code?.toLowerCase() ?? '',
        quality: quality ? parseFloat(quality) : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first matching locale
  for (const lang of languages) {
    // Check exact match first
    if (isValidLocale(lang.code)) {
      return lang.code;
    }

    // Check language-only match (e.g., 'pt' matches 'pt-BR')
    const langPrefix = lang.code.split('-')[0];
    const match = SUPPORTED_LOCALES.find((locale) =>
      locale.toLowerCase().startsWith(langPrefix ?? '')
    );

    if (match) {
      return match;
    }
  }

  return DEFAULT_LOCALE;
}

export function detectLocaleFromRequest(request: NextRequest): Locale {
  // 1. Check cookie first
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [code] = lang.trim().split(';');
        return code?.toLowerCase() ?? '';
      });

    for (const lang of languages) {
      if (isValidLocale(lang)) {
        return lang;
      }

      const langPrefix = lang.split('-')[0];
      const match = SUPPORTED_LOCALES.find((locale) =>
        locale.toLowerCase().startsWith(langPrefix ?? '')
      );

      if (match) {
        return match;
      }
    }
  }

  return DEFAULT_LOCALE;
}

export async function setLocaleCookie(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  });
}

export async function getCurrentLocale(): Promise<Locale> {
  // Try cookie first, then headers
  const cookieLocale = await getLocaleFromCookies();
  if (cookieLocale !== DEFAULT_LOCALE) {
    return cookieLocale;
  }

  return getLocaleFromHeaders();
}
