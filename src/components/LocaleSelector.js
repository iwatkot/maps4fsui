'use client';

import { useState } from 'react';
import { useLocale } from '@/contexts/LocaleContext';

/**
 * Language selector in the app header, styled to match the Selector component.
 * Hidden while loading or when only one locale is available.
 */
export default function LocaleSelector() {
  const { locale, availableLocales, changeLocale, isLoaded } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  if (!isLoaded || availableLocales.length <= 1) return null;

  const current = availableLocales.find(l => l.code === locale);
  const displayName = current?.localized || current?.full || locale.toUpperCase();

  const handleSelect = (code) => {
    changeLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="gradient-surface interactive-shadow focus-ring flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200"
        aria-label="Select language"
        title="Select language"
      >
        <i className="zmdi zmdi-globe-alt" style={{ fontSize: '1rem' }}></i>
        <span>{displayName}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Click-outside backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div
            className="panel-backdrop absolute right-0 z-30 mt-2 min-w-[120px] overflow-hidden"
            style={{ animation: 'dropdownOpen 200ms ease-out forwards' }}
          >
            {availableLocales.map(({ code, localized, full }) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`dropdown-option ${locale === code ? 'dropdown-option--selected' : ''}`}
              >
                <div className={`status-dot ${locale === code ? 'status-dot--active' : 'status-dot--inactive'}`} />
                <span className="font-medium text-gray-900 dark:text-white">
                  {localized || full || code.toUpperCase()}
                </span>
                {locale === code && (
                  <svg className="w-4 h-4 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
