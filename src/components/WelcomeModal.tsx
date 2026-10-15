import React, { useState } from 'react';
import { useApp } from '../store';
import { COUNTRIES, CURRENCIES, getCountryByCode } from '../preferences';
import { Button } from './Layout';
import { Globe, DollarSign, Languages, Check, Plane } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { state, setPreferences, t } = useApp();
  const lang = state.lang;
  
  const [selectedCountry, setSelectedCountry] = useState(state.preferences.country);
  const [selectedCurrency, setSelectedCurrency] = useState(state.preferences.currency);
  const [selectedLang, setSelectedLang] = useState<'ar' | 'en'>(state.preferences.language);

  if (!isOpen) return null;

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    const country = getCountryByCode(code);
    if (country) {
      setSelectedCurrency(country.currency);
      setSelectedLang(country.defaultLanguage);
    }
  };

  const handleSave = () => {
    setPreferences({
      country: selectedCountry,
      currency: selectedCurrency,
      language: selectedLang,
    });
    onClose();
  };

  const selectedCountryData = getCountryByCode(selectedCountry);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plane size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {t('مرحباً بك!', 'Welcome!')}
              </h2>
              <p className="text-sm text-emerald-100">
                {t('سفريات النخبة', 'Elite Visa Services')}
              </p>
            </div>
          </div>
          <p className="text-sm text-emerald-100">
            {t('اختر تفضيلاتك للحصول على تجربة مخصصة', 'Choose your preferences for a personalized experience')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Country Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
              <Globe size={16} className="text-emerald-600" />
              {t('البلد', 'Country')}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-start transition-all ${
                    selectedCountry === country.code
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                    {country.name[lang]}
                  </span>
                  {selectedCountry === country.code && (
                    <Check size={14} className="text-emerald-600 ms-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
              <DollarSign size={16} className="text-emerald-600" />
              {t('العملة', 'Currency')}
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name[lang]} ({currency.code})
                </option>
              ))}
            </select>
            {selectedCountryData && selectedCountryData.currency !== selectedCurrency && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {t('⚠️ العملة المختارة تختلف عن العملة الافتراضية للبلد', '⚠️ Selected currency differs from country default')}
              </p>
            )}
          </div>

          {/* Language Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
              <Languages size={16} className="text-emerald-600" />
              {t('اللغة', 'Language')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedLang('ar')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  selectedLang === 'ar'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-lg">🇸🇦</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">العربية</span>
                {selectedLang === 'ar' && <Check size={14} className="text-emerald-600" />}
              </button>
              <button
                onClick={() => setSelectedLang('en')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  selectedLang === 'en'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-lg">🇬🇧</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">English</span>
                {selectedLang === 'en' && <Check size={14} className="text-emerald-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
          <Button onClick={handleSave} className="w-full" size="lg">
            {t('حفظ ومتابعة', 'Save & Continue')}
          </Button>
          <p className="text-xs text-slate-500 text-center mt-3">
            {t('يمكنك تغيير هذه الإعدادات في أي وقت من الشريط العلوي', 'You can change these settings anytime from the top bar')}
          </p>
        </div>
      </div>
    </div>
  );
}
