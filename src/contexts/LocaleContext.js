'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import yaml from 'js-yaml';

const LocaleContext = createContext(null);

/**
 * Navigate a nested object by dot-separated path.
 * Returns null if the key doesn't exist or the resolved value is an object (non-leaf).
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return null;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return null;
    current = current[part];
  }
  if (current == null || typeof current === 'object') return null;
  return String(current);
}

/**
 * Fetch and parse a YAML file, returning null on any failure.
 */
async function fetchYaml(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const text = await response.text();
    return yaml.load(text);
  } catch {
    return null;
  }
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const [translations, setTranslations] = useState(null);
  // availableLocales: array of { code, full, localized }
  const [availableLocales, setAvailableLocales] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Discover available locales from manifest
      let localeList = [];
      try {
        const res = await fetch('/locales/manifest.json');
        if (res.ok) {
          const manifest = await res.json();
          localeList = Array.isArray(manifest.locales) ? manifest.locales : [];
        }
      } catch {
        // manifest missing – fall back to English only
      }
      if (localeList.length === 0) {
        localeList = [{ code: 'en', full: 'English', localized: 'English' }];
      }
      setAvailableLocales(localeList);

      // 2. Determine target locale
      //    Priority: stored preference → browser language → first in list → 'en'
      let targetCode = null;
      try {
        targetCode = localStorage.getItem('maps4fs-locale');
      } catch {}

      const codes = localeList.map(l => l.code);

      if (!targetCode || !codes.includes(targetCode)) {
        const browserLang = (navigator.language || '').split('-')[0].toLowerCase();
        targetCode = codes.includes(browserLang) ? browserLang : null;
      }

      if (!targetCode) {
        targetCode = codes.includes('en') ? 'en' : codes[0];
      }

      // 3. Load YAML, fall back to English on failure
      let data = await fetchYaml(`/locales/${targetCode}.yml`);
      if (!data && targetCode !== 'en') {
        data = await fetchYaml('/locales/en.yml');
        targetCode = 'en';
      }

      if (data) {
        setTranslations(data);
        setLocale(targetCode);
      }

      setIsLoaded(true);
    };

    init();
  }, []);

  /**
   * Switch to a different locale.  Persists the choice in localStorage.
   */
  const changeLocale = useCallback(async (code) => {
    const data = await fetchYaml(`/locales/${code}.yml`);
    if (data) {
      setTranslations(data);
      setLocale(code);
      try {
        localStorage.setItem('maps4fs-locale', code);
      } catch {}
    }
  }, []);

  /**
   * t(path, fallback?)
   *
   * Resolve a dot-separated locale key, e.g.
   *   t('docker.map_generator.label', 'Map Generator')
   *
   * Returns the translated string, or `fallback` (default null) when the key
   * is missing or translations have not loaded yet.  Callers should always
   * provide a meaningful fallback so the UI still works without any locale
   * files present.
   */
  const t = useCallback((path, fallback = null) => {
    if (!translations) return fallback;
    const val = getNestedValue(translations, path);
    return val ?? fallback;
  }, [translations]);

  return (
    <LocaleContext.Provider value={{ locale, t, availableLocales, changeLocale, isLoaded }}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to consume the locale context.
 * Safe to call outside the provider – returns a no-op `t` function so components
 * that haven't been wrapped yet continue to render with their hardcoded fallbacks.
 */
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    return {
      locale: 'en',
      t: (_path, fallback = null) => fallback,
      availableLocales: [],
      changeLocale: async () => {},
      isLoaded: false,
    };
  }
  return context;
}
