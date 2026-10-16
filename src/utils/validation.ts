// Enhanced validation utilities for applicant data

export const validateDateOfBirth = (date: string): { valid: boolean; message?: string } => {
  if (!date) return { valid: false, message: 'تاريخ الميلاد مطلوب' };
  
  const birthDate = new Date(date);
  const today = new Date();
  
  // Cannot be in the future
  if (birthDate > today) {
    return { valid: false, message: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل' };
  }
  
  // Must be at least 18 years old
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 18) {
    return { valid: false, message: 'يجب أن يكون العمر 18 سنة على الأقل' };
  }
  
  // Cannot be older than 120 years
  if (age > 120) {
    return { valid: false, message: 'تاريخ الميلاد غير صحيح' };
  }
  
  return { valid: true };
};

export const validatePassportExpiry = (date: string): { valid: boolean; message?: string } => {
  if (!date) return { valid: false, message: 'تاريخ انتهاء الجواز مطلوب' };
  
  const expiryDate = new Date(date);
  const today = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(today.getMonth() + 6);
  
  // Must be in the future
  if (expiryDate <= today) {
    return { valid: false, message: 'الجواز منتهي الصلاحية' };
  }
  
  // Must be valid for at least 6 months
  if (expiryDate < sixMonthsFromNow) {
    return { valid: false, message: 'يجب أن يكون الجواز صالحاً لمدة 6 أشهر على الأقل' };
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
  if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(cleaned)) {
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
