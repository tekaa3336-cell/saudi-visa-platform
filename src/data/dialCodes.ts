export interface DialCodeOption {
  /** International dial code including "+", unique per entry (used as the <select> value) */
  dial: string;
  name: { ar: string; en: string };
}

/** Default dial code selected in the application form */
export const DEFAULT_DIAL_CODE = '+966';

export const DIAL_CODES: DialCodeOption[] = [
  { dial: '+966', name: { ar: 'السعودية', en: 'Saudi Arabia' } },
  { dial: '+971', name: { ar: 'الإمارات', en: 'UAE' } },
  { dial: '+20', name: { ar: 'مصر', en: 'Egypt' } },
  { dial: '+962', name: { ar: 'الأردن', en: 'Jordan' } },
  { dial: '+965', name: { ar: 'الكويت', en: 'Kuwait' } },
  { dial: '+974', name: { ar: 'قطر', en: 'Qatar' } },
  { dial: '+973', name: { ar: 'البحرين', en: 'Bahrain' } },
  { dial: '+968', name: { ar: 'عُمان', en: 'Oman' } },
  { dial: '+967', name: { ar: 'اليمن', en: 'Yemen' } },
  { dial: '+964', name: { ar: 'العراق', en: 'Iraq' } },
  { dial: '+963', name: { ar: 'سوريا', en: 'Syria' } },
  { dial: '+961', name: { ar: 'لبنان', en: 'Lebanon' } },
  { dial: '+970', name: { ar: 'فلسطين', en: 'Palestine' } },
  { dial: '+218', name: { ar: 'ليبيا', en: 'Libya' } },
  { dial: '+216', name: { ar: 'تونس', en: 'Tunisia' } },
  { dial: '+213', name: { ar: 'الجزائر', en: 'Algeria' } },
  { dial: '+212', name: { ar: 'المغرب', en: 'Morocco' } },
  { dial: '+249', name: { ar: 'السودان', en: 'Sudan' } },
  { dial: '+252', name: { ar: 'الصومال', en: 'Somalia' } },
  { dial: '+222', name: { ar: 'موريتانيا', en: 'Mauritania' } },
  { dial: '+253', name: { ar: 'جيبوتي', en: 'Djibouti' } },
  { dial: '+269', name: { ar: 'جزر القمر', en: 'Comoros' } },
  { dial: '+92', name: { ar: 'باكستان', en: 'Pakistan' } },
  { dial: '+91', name: { ar: 'الهند', en: 'India' } },
  { dial: '+880', name: { ar: 'بنغلاديش', en: 'Bangladesh' } },
  { dial: '+62', name: { ar: 'إندونيسيا', en: 'Indonesia' } },
  { dial: '+60', name: { ar: 'ماليزيا', en: 'Malaysia' } },
  { dial: '+63', name: { ar: 'الفلبين', en: 'Philippines' } },
  { dial: '+90', name: { ar: 'تركيا', en: 'Turkey' } },
  { dial: '+98', name: { ar: 'إيران', en: 'Iran' } },
  { dial: '+93', name: { ar: 'أفغانستان', en: 'Afghanistan' } },
  { dial: '+1', name: { ar: 'أمريكا/كندا', en: 'USA/Canada' } },
  { dial: '+44', name: { ar: 'بريطانيا', en: 'United Kingdom' } },
  { dial: '+33', name: { ar: 'فرنسا', en: 'France' } },
  { dial: '+49', name: { ar: 'ألمانيا', en: 'Germany' } },
];
