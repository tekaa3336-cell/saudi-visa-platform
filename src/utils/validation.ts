// Enhanced validation utilities for applicant data

export type ValidationResult = {
  valid: boolean;
  /** Arabic error message */
  message?: string;
  /** English error message (for the English UI) */
  messageEn?: string;
};

// ---------------------------------------------------------------------------
// Strict date helpers
// ---------------------------------------------------------------------------

export const MIN_BIRTH_YEAR = 1920;
export const MAX_BIRTH_YEAR = 2026;
/** A passport cannot realistically be valid for longer than this many years from today */
export const MAX_PASSPORT_VALIDITY_YEARS = 20;

const pad = (n: number) => String(n).padStart(2, '0');

const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Today's date (local time) as YYYY-MM-DD */
export const todayISO = (): string => toISO(new Date());

/** Tomorrow's date (local time) as YYYY-MM-DD */
export const tomorrowISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISO(d);
};

/** Latest allowed date of birth: today, but never beyond MAX_BIRTH_YEAR */
export const maxBirthDateISO = (): string => {
  const cap = `${MAX_BIRTH_YEAR}-12-31`;
  const today = todayISO();
  return today < cap ? today : cap;
};

export const minBirthDateISO = (): string => `${MIN_BIRTH_YEAR}-01-01`;

/**
 * Strictly parses a YYYY-MM-DD string (exactly 4-digit year) and confirms it is a real
 * calendar date. Returns null for anything else (e.g. "0000-00-00", "2001-02-30",
 * 5/6-digit years that some browsers allow in <input type="date">).
 */
const parseStrictISODate = (value: string): { y: number; m: number; d: number } | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1) return null;
  const daysInMonth = new Date(Date.UTC(2000 + (y % 400), m, 0)).getUTCDate(); // 400-yr cycle keeps leap years correct
  if (d > daysInMonth) return null;
  return { y, m, d };
};

export const validateDateOfBirth = (date: string): ValidationResult => {
  if (!date) {
    return { valid: false, message: 'تاريخ الميلاد مطلوب', messageEn: 'Date of birth is required' };
  }

  const parsed = parseStrictISODate(date);
  if (!parsed) {
    return {
      valid: false,
      message: 'تاريخ الميلاد غير صحيح، يرجى إدخال تاريخ حقيقي',
      messageEn: 'Invalid date of birth. Please enter a real date',
    };
  }

  // Blocks fake years such as 0000 / 1111 / 2222 and anything outside the allowed range
  if (parsed.y < MIN_BIRTH_YEAR || parsed.y > MAX_BIRTH_YEAR) {
    return {
      valid: false,
      message: `سنة الميلاد غير صحيحة، يجب أن تكون بين ${MIN_BIRTH_YEAR} و ${MAX_BIRTH_YEAR}`,
      messageEn: `Invalid birth year. It must be between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}`,
    };
  }

  // Cannot be in the future (ISO strings compare correctly as text)
  if (date > todayISO()) {
    return {
      valid: false,
      message: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل',
      messageEn: 'Date of birth cannot be in the future',
    };
  }

  return { valid: true };
};

export const validatePassportExpiry = (date: string): ValidationResult => {
  if (!date) {
    return { valid: false, message: 'تاريخ انتهاء الجواز مطلوب', messageEn: 'Passport expiry date is required' };
  }

  const parsed = parseStrictISODate(date);
  if (!parsed) {
    return {
      valid: false,
      message: 'تاريخ انتهاء الجواز غير صحيح، يرجى إدخال تاريخ حقيقي',
      messageEn: 'Invalid passport expiry date. Please enter a real date',
    };
  }

  // Must be a future date (today itself counts as expired)
  if (date <= todayISO()) {
    return {
      valid: false,
      message: 'الجواز منتهي الصلاحية، يجب أن يكون تاريخ الانتهاء في المستقبل',
      messageEn: 'Passport is expired. The expiry date must be in the future',
    };
  }

  // Blocks fake far-future dates such as 9999
  const maxYear = new Date().getFullYear() + MAX_PASSPORT_VALIDITY_YEARS;
  if (parsed.y > maxYear) {
    return {
      valid: false,
      message: 'تاريخ انتهاء الجواز غير منطقي، يرجى التأكد من التاريخ المدخل',
      messageEn: 'Passport expiry date is not realistic. Please check the date you entered',
    };
  }

  return { valid: true };
};

export const validatePassportNumber = (passport: string): { valid: boolean; message?: string } => {
  if (!passport.trim()) return { valid: false, message: 'رقم الجواز مطلوب' };

  // Remove spaces and convert to uppercase
  const cleaned = passport.trim().toUpperCase();

  // Check length (6-9 characters)
  if (cleaned.length < 6 || cleaned.length > 9) {
    return { valid: false, message: 'رقم الجواز يجب أن يكون بين 6-9 أحرف' };
  }

  // Must be alphanumeric
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return { valid: false, message: 'رقم الجواز يجب أن يحتوي على أحرف وأرقام فقط' };
  }

  // Prevent repetitive patterns (e.g., AAAAAA, 111111)
  if (/^([A-Z])\1{5,}$/.test(cleaned) || /^([0-9])\1{5,}$/.test(cleaned)) {
    return { valid: false, message: 'رقم الجواز غير صحيح' };
  }

  return { valid: true };
};

export const validateFullName = (name: string): { valid: boolean; message?: string } => {
  if (!name.trim()) return { valid: false, message: 'الاسم الكامل مطلوب' };

  // Strip extra spaces
  const cleaned = name.trim().replace(/\s+/g, ' ');

  // Must have at least 2 words
  const words = cleaned.split(' ');
  if (words.length < 2) {
    return { valid: false, message: 'يجب إدخال الاسم الكامل (الاسم الأول واسم العائلة)' };
  }

  // Check for valid characters (Arabic, English, spaces)
  if (!/^[؀-ۿa-zA-Z\s]+$/.test(cleaned)) {
    return { valid: false, message: 'الاسم يجب أن يحتوي على أحرف فقط' };
  }

  // Each word must be at least 2 characters
  const invalidWord = words.find(word => word.length < 2);
  if (invalidWord) {
    return { valid: false, message: 'كل كلمة في الاسم يجب أن تكون حرفين على الأقل' };
  }

  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; message?: string } => {
  if (!phone.trim()) return { valid: true }; // Optional field

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // Must start with + or contain only digits
  if (!/^[\+]?[0-9]{8,15}$/.test(cleaned)) {
    return { valid: false, message: 'رقم الهاتف غير صحيح' };
  }

  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email.trim()) return { valid: true }; // Optional field

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'البريد الإلكتروني غير صحيح' };
  }

  return { valid: true };
};

// Sanitize text input
export const sanitizeTextInput = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

// Sanitize passport number
export const sanitizePassportNumber = (passport: string): string => {
  return passport.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
};
