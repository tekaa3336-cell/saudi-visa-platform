import React, { useState } from 'react';
import { useApp } from '../store';
import { COUNTRIES, CURRENCIES, getCountryByCode } from '../preferences';
import { Button } from './Layout';
import { Globe, DollarSign, Languages, Plane, X } from 'lucide-react';

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
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label={t('إغلاق', 'Close')}
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Plane size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('مرحباً بك!', 'Welcome!')}</h2>
              <p className="text-xs text-emerald-100">{t('سفريات النخبة', 'Elite Visa Services')}</p>
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-3">
            {t('اختر تفضيلاتك للحصول على تجربة مخصصة', 'Choose your preferences for a personalized experience')}
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Country Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
              <Globe size={15} className="text-emerald-600 dark:text-emerald-400" />
              {t('البلد', 'Country')}
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            >
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name[lang]}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
              <DollarSign size={15} className="text-emerald-600 dark:text-emerald-400" />
              {t('العملة', 'Currency')}
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name[lang]} ({currency.code})
                </option>
              ))}
            </select>
            {selectedCountryData && selectedCountryData.currency !== selectedCurrency && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                <span>⚠️</span>
                {t('العملة المختارة تختلف عن العملة الافتراضية للبلد', 'Selected currency differs from country default')}
              </p>
            )}
          </div>

          {/* Language Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
              <Languages size={15} className="text-emerald-600 dark:text-emerald-400" />
              {t('اللغة', 'Language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedLang('ar')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedLang === 'ar'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>🇸🇦</span>
                <span>العربية</span>
              </button>
              <button
                onClick={() => setSelectedLang('en')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedLang === 'en'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <Button onClick={handleSave} className="w-full" size="lg">
            {t('حفظ ومتابعة', 'Save & Continue')}
          </Button>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2.5">
            {t('يمكنك تغيير هذه الإعدادات في أي وقت من الشريط العلوي', 'You can change these settings anytime from the top bar')}
          </p>
        </div>
      </div>
    </div>
  );
}
