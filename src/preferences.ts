// ============================================
// Countries & Currencies Data
// ============================================

export interface Country {
  code: string;
  name: { ar: string; en: string };
  flag: string;
  currency: string;
  defaultLanguage: 'ar' | 'en';
}

export interface Currency {
  code: string;
  symbol: string;
  name: { ar: string; en: string };
  rate: number; // Rate relative to AED (base)
}

export const COUNTRIES: Country[] = [
  { code: 'SA', name: { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia' }, flag: '🇸🇦', currency: 'SAR', defaultLanguage: 'ar' },
  { code: 'AE', name: { ar: 'الإمارات العربية المتحدة', en: 'United Arab Emirates' }, flag: '🇦🇪', currency: 'AED', defaultLanguage: 'ar' },
  { code: 'EG', name: { ar: 'مصر', en: 'Egypt' }, flag: '🇪🇬', currency: 'EGP', defaultLanguage: 'ar' },
  { code: 'KW', name: { ar: 'الكويت', en: 'Kuwait' }, flag: '🇰🇼', currency: 'KWD', defaultLanguage: 'ar' },
  { code: 'QA', name: { ar: 'قطر', en: 'Qatar' }, flag: '🇶🇦', currency: 'QAR', defaultLanguage: 'ar' },
  { code: 'BH', name: { ar: 'البحرين', en: 'Bahrain' }, flag: '🇧🇭', currency: 'BHD', defaultLanguage: 'ar' },
  { code: 'OM', name: { ar: 'عُمان', en: 'Oman' }, flag: '🇴🇲', currency: 'OMR', defaultLanguage: 'ar' },
  { code: 'JO', name: { ar: 'الأردن', en: 'Jordan' }, flag: '🇯🇴', currency: 'JOD', defaultLanguage: 'ar' },
  { code: 'PK', name: { ar: 'باكستان', en: 'Pakistan' }, flag: '🇵🇰', currency: 'PKR', defaultLanguage: 'en' },
  { code: 'IN', name: { ar: 'الهند', en: 'India' }, flag: '🇮🇳', currency: 'INR', defaultLanguage: 'en' },
  { code: 'GB', name: { ar: 'المملكة المتحدة', en: 'United Kingdom' }, flag: '🇬🇧', currency: 'GBP', defaultLanguage: 'en' },
  { code: 'US', name: { ar: 'الولايات المتحدة', en: 'United States' }, flag: '🇺🇸', currency: 'USD', defaultLanguage: 'en' },
  { code: 'MY', name: { ar: 'ماليزيا', en: 'Malaysia' }, flag: '🇲🇾', currency: 'MYR', defaultLanguage: 'en' },
  { code: 'ID', name: { ar: 'إندونيسيا', en: 'Indonesia' }, flag: '🇮🇩', currency: 'IDR', defaultLanguage: 'en' },
  { code: 'TR', name: { ar: 'تركيا', en: 'Turkey' }, flag: '🇹🇷', currency: 'TRY', defaultLanguage: 'en' },
];

export const CURRENCIES: Currency[] = [
  { code: 'SAR', symbol: 'ر.س', name: { ar: 'ريال سعودي', en: 'Saudi Riyal' }, rate: 0.93 },
  { code: 'AED', symbol: 'د.إ', name: { ar: 'درهم إماراتي', en: 'UAE Dirham' }, rate: 1 },
  { code: 'USD', symbol: '$', name: { ar: 'دولار أمريكي', en: 'US Dollar' }, rate: 0.27 },
  { code: 'EGP', symbol: 'ج.م', name: { ar: 'جنيه مصري', en: 'Egyptian Pound' }, rate: 13.5 },
  { code: 'KWD', symbol: 'د.ك', name: { ar: 'دينار كويتي', en: 'Kuwaiti Dinar' }, rate: 0.083 },
  { code: 'QAR', symbol: 'ر.ق', name: { ar: 'ريال قطري', en: 'Qatari Riyal' }, rate: 0.98 },
  { code: 'BHD', symbol: 'د.ب', name: { ar: 'دينار بحريني', en: 'Bahraini Dinar' }, rate: 0.1 },
  { code: 'OMR', symbol: 'ر.ع', name: { ar: 'ريال عُماني', en: 'Omani Rial' }, rate: 0.1 },
  { code: 'JOD', symbol: 'د.أ', name: { ar: 'دينار أردني', en: 'Jordanian Dinar' }, rate: 0.19 },
  { code: 'GBP', symbol: '£', name: { ar: 'جنيه إسترليني', en: 'British Pound' }, rate: 0.21 },
  { code: 'EUR', symbol: '€', name: { ar: 'يورو', en: 'Euro' }, rate: 0.25 },
  { code: 'PKR', symbol: '₨', name: { ar: 'روبية باكستانية', en: 'Pakistani Rupee' }, rate: 75 },
  { code: 'INR', symbol: '₹', name: { ar: 'روبية هندية', en: 'Indian Rupee' }, rate: 22.5 },
  { code: 'MYR', symbol: 'RM', name: { ar: 'رينغيت ماليزي', en: 'Malaysian Ringgit' }, rate: 1.2 },
  { code: 'IDR', symbol: 'Rp', name: { ar: 'روبية إندونيسية', en: 'Indonesian Rupiah' }, rate: 4200 },
  { code: 'TRY', symbol: '₺', name: { ar: 'ليرة تركية', en: 'Turkish Lira' }, rate: 8.5 },
];

// Convert amount from AED to target currency
export function convertCurrency(amountAED: number, targetCurrency: string): number {
  const currency = CURRENCIES.find(c => c.code === targetCurrency);
  if (!currency) return amountAED;
  return Math.round(amountAED * currency.rate * 100) / 100;
}

// Format currency with localized symbol/code
export function formatCurrency(amount: number, currencyCode: string, lang: 'ar' | 'en'): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return `${amount} ${currencyCode}`;
  
  const formattedAmount = amount.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  // In Arabic: use Arabic symbols (ر.س, د.إ, ج.م)
  // In English: use currency codes (SAR, AED, EGP)
  if (lang === 'ar') {
    return `${formattedAmount} ${currency.symbol}`;
  }
  return `${currency.code} ${formattedAmount}`;
}

// Get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

// Get currency by code
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}
