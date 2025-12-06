'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import type { Locale } from '../config';
import en from '../dictionaries/en.json';
import ptBR from '../dictionaries/pt-BR.json';

type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  'pt-BR': ptBR as Dictionary,
};

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof value === 'string' ? value : path;
}

function interpolate(
  text: string,
  values: Record<string, string | number>
): string {
  return text.replace(/{(\w+)}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });
}

const LOCALE_STORAGE_KEY = 'vitai-locale';

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'en' || stored === 'pt-BR') return stored;
  } catch {
    // localStorage not available
  }
  return 'en';
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // localStorage not available
    }
  }, []);

  const dictionary = dictionaries[locale] || dictionaries.en;

  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const translation = getNestedValue(dictionary, key);

      if (values) {
        return interpolate(translation, values);
      }

      return translation;
    },
    [dictionary]
  );

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      return new Intl.DateTimeFormat(locale, options).format(date);
    },
    [locale]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(locale, options).format(value);
    },
    [locale]
  );

  const formatRelativeTime = useCallback(
    (date: Date): string => {
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return t('common.today');
      if (diffDays === -1) return t('common.yesterday');

      return formatDate(date, { month: 'short', day: 'numeric' });
    },
    [t, formatDate]
  );

  return useMemo(
    () => ({
      t,
      locale,
      setLocale,
      formatDate,
      formatNumber,
      formatRelativeTime,
    }),
    [t, locale, setLocale, formatDate, formatNumber, formatRelativeTime]
  );
}

// Server-side translation function
export function getTranslation(locale: Locale = 'en') {
  const dictionary = dictionaries[locale] || dictionaries.en;

  function t(key: string, values?: Record<string, string | number>): string {
    const translation = getNestedValue(dictionary, key);

    if (values) {
      return interpolate(translation, values);
    }

    return translation;
  }

  return { t, locale };
}
