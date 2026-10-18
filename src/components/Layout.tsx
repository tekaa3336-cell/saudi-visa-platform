import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import { COUNTRIES, CURRENCIES, getCountryByCode } from '../preferences';
import { WelcomeModal } from './WelcomeModal';
import {
  Menu, X, Moon, Sun, User, LogOut, Plane, Phone,
  MessageCircle, Mail, Home, FileText, BarChart3, HelpCircle,
  ChevronDown, DollarSign, Languages
} from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { state, setTheme, logout, setPreferences, markWelcomeSeen, t } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!state.hasSeenWelcome);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCountry = getCountryByCode(state.preferences.country);

  const handleCountryChange = (code: string) => {
    const country = getCountryByCode(code);
    if (country) {
      setPreferences({
        ...state.preferences,
        country: code,
        currency: country.currency,
      });
    }
    setShowCountryMenu(false);
  };

  const handleCurrencyChange = (code: string) => {
    setPreferences({
      ...state.preferences,
      currency: code,
    });
    setShowCurrencyMenu(false);
  };

  const handleLangChange = () => {
    const newLang = state.lang === 'ar' ? 'en' : 'ar';
    setPreferences({
      ...state.preferences,
      language: newLang,
    });
  };

  const handleCloseWelcome = () => {
    markWelcomeSeen();
    setShowWelcome(false);
  };

  const navLinks = [
    { path: '/', label: t('الرئيسية', 'Home'), icon: Home },
    { path: '/services', label: t('الخدمات', 'Services'), icon: FileText },
    { path: '/track', label: t('تتبع الطلب', 'Track'), icon: BarChart3 },
    { path: '/faq', label: t('الأسئلة', 'FAQ'), icon: HelpCircle },
    { path: '/contact', label: t('تواصل', 'Contact'), icon: Mail },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1"><Phone size={11} /><span dir="ltr">+971 4 XXX XXXX</span></span>
            <span className="hidden lg:flex items-center gap-1"><Mail size={11} />info@elitevisa.demo</span>
          </div>
          
          {/* Preferences Selectors */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Country Selector */}
            <div className="relative">
              <button
                onClick={() => { setShowCountryMenu(!showCountryMenu); setShowCurrencyMenu(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                title={t('اختر البلد', 'Select Country')}
              >
                <span className="text-sm">{selectedCountry?.flag || '🌍'}</span>
                <span className="hidden sm:inline">{selectedCountry?.code || 'SA'}</span>
                <ChevronDown size={10} className="hidden sm:block" />
              </button>
              {showCountryMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCountryMenu(false)} />
                  <div className="absolute top-full mt-1 end-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[200px] max-h-64 overflow-y-auto z-50">
                    {COUNTRIES.map(country => (
                      <button
                        key={country.code}
                        onClick={() => handleCountryChange(country.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded text-start text-xs hover:bg-slate-100 dark:hover:bg-slate-700 ${
                          state.preferences.country === country.code ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-base">{country.flag}</span>
                        <span className="flex-1 truncate">{country.name[state.lang]}</span>
                        {state.preferences.country === country.code && <span className="text-emerald-600">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => { setShowCurrencyMenu(!showCurrencyMenu); setShowCountryMenu(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                title={t('اختر العملة', 'Select Currency')}
              >
                <DollarSign size={11} />
                <span className="hidden sm:inline">{state.preferences.currency}</span>
                <ChevronDown size={10} className="hidden sm:block" />
              </button>
              {showCurrencyMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCurrencyMenu(false)} />
                  <div className="absolute top-full mt-1 end-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[220px] max-h-64 overflow-y-auto z-50">
                    {CURRENCIES.map(currency => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencyChange(currency.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded text-start text-xs hover:bg-slate-100 dark:hover:bg-slate-700 ${
                          state.preferences.currency === currency.code ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-mono font-bold">{currency.symbol}</span>
                        <span className="flex-1 truncate">{currency.name[state.lang]}</span>
                        <span className="text-slate-400">{currency.code}</span>
                        {state.preferences.currency === currency.code && <span className="text-emerald-600">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Language Toggle */}
            <button
              onClick={handleLangChange}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              title={t('تغيير اللغة', 'Change Language')}
            >
              <Languages size={12} />
              <span>{state.lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(state.theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 rounded hover:bg-slate-800 transition-colors"
              title={t('تغيير المظهر', 'Toggle Theme')}
            >
              {state.theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
              <Plane size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">{t('سفريات النخبة', 'Elite Visa')}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {state.isAuthenticated ? (
              <>
              <Link to={state.currentUser?.role === 'agency_owner' ? '/agency' : '/dashboard'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <User size={14} />{state.currentUser?.name}
              </Link>
                <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title={t('تسجيل الخروج', 'Logout')}>
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap">
                  {t('تسجيل الدخول', 'Login')}
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap shadow-sm">
                  {t('إنشاء حساب', 'Register')}
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <link.icon size={15} />{link.label}
                </Link>
              ))}
              <hr className="my-2 border-slate-200 dark:border-slate-700" />
              {state.isAuthenticated ? (
                <>
                  <Link to={state.currentUser?.role === 'agency_owner' ? '/agency' : '/dashboard'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <User size={15} />{t('لوحة التحكم', 'Dashboard')}
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600">
                    <LogOut size={15} />{t('خروج', 'Logout')}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap">
                    {t('تسجيل الدخول', 'Login')}
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center px-4 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap shadow-sm">
                    {t('حساب جديد', 'Register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                  <Plane size={16} className="text-white" />
                </div>
                <span className="font-bold">{t('سفريات النخبة', 'Elite Visa')}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {t('منصة خدمات مستقلة تساعد في إعداد طلبات التأشيرات. القرار النهائي يعود للجهات الرسمية.', 'Independent service platform assisting with visa applications. Final decisions rest with official authorities.')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t('خدماتنا', 'Services')}</h4>
              <ul className="space-y-1.5">
                {SERVICES.slice(0, 4).map(s => (
                  <li key={s.id}><Link to={`/services/${s.id}`} className="text-slate-400 hover:text-emerald-400 text-xs">{s.name[state.lang]}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t('روابط', 'Links')}</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/track" className="text-slate-400 hover:text-emerald-400">{t('تتبع الطلب', 'Track')}</Link></li>
                <li><Link to="/faq" className="text-slate-400 hover:text-emerald-400">{t('الأسئلة الشائعة', 'FAQ')}</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-emerald-400">{t('الخصوصية', 'Privacy')}</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-emerald-400">{t('الشروط', 'Terms')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-6 pt-4 text-center text-xs text-slate-500">
            {t('© 2024 سفريات النخبة. منصة خدمات مستقلة - ليست جهة حكومية.', '© 2024 Elite Visa. Independent platform - not a government entity.')}
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a href="https://wa.me/9714XXXXXXXX" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-4 end-4 z-50 w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        aria-label="WhatsApp">
        <MessageCircle size={20} className="text-white" />
      </a>
    </div>
  );
}

// Shared Components
export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`} {...props}>{children}</div>;
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700',
    outline: 'border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
  return <button className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

export function Badge({ children, color = 'default' }: { children: React.ReactNode; color?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' }) {
  const colors = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}

export function Input({ label, error, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <input className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${error ? 'border-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, options, error, className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[]; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <select className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${className}`} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <textarea className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 ${className}`} {...props} />
    </div>
  );
}

export function Stepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-between w-full mb-6">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              idx < currentStep ? 'bg-emerald-600 text-white' : idx === currentStep ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>{idx < currentStep ? '✓' : idx + 1}</div>
            <span className={`text-[10px] text-center max-w-[70px] ${idx <= currentStep ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>{step}</span>
          </div>
          {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${idx < currentStep ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status, lang }: { status: string; lang: 'ar' | 'en' }) {
  const labels: Record<string, { ar: string; en: string }> = {
    draft: { ar: 'مسودة', en: 'Draft' }, submitted: { ar: 'مُقدَّم', en: 'Submitted' },
    document_review: { ar: 'مراجعة', en: 'Review' }, needs_revision: { ar: 'يتطلب تعديل', en: 'Needs changes' },
    processing: { ar: 'معالجة', en: 'Processing' },
    verified: { ar: 'تحقق', en: 'Verified' }, approved_for_payment: { ar: 'معتمد', en: 'Approved' },
    payment_pending: { ar: 'دفع', en: 'Payment' }, completed: { ar: 'مكتمل', en: 'Completed' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }, cancelled: { ar: 'ملغي', en: 'Cancelled' },
  };
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700', submitted: 'bg-blue-100 text-blue-700',
    document_review: 'bg-yellow-100 text-yellow-700', needs_revision: 'bg-amber-100 text-amber-800',
    processing: 'bg-purple-100 text-purple-700',
    verified: 'bg-emerald-100 text-emerald-700', approved_for_payment: 'bg-green-100 text-green-700',
    payment_pending: 'bg-orange-100 text-orange-700', completed: 'bg-emerald-600 text-white',
    rejected: 'bg-red-100 text-red-700', cancelled: 'bg-gray-200 text-gray-600',
  };
  const label = labels[status];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{label ? label[lang] : status}</span>;
}
