import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import {
  Menu, X, Globe, Moon, Sun, User, LogOut, ChevronDown,
  Plane, Phone, MessageCircle, Shield, Home, FileText,
  BarChart3, Building2, Settings, HelpCircle, Mail
} from 'lucide-react';

// ============================================
// Layout Component
// ============================================
export function Layout({ children }: { children: React.ReactNode }) {
  const { state, setLang, setTheme, logout, t, isRTL } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: t('الرئيسية', 'Home'), icon: Home },
    { path: '/services', label: t('الخدمات', 'Services'), icon: FileText },
    { path: '/track', label: t('تتبع الطلب', 'Track'), icon: BarChart3 },
    { path: '/faq', label: t('الأسئلة الشائعة', 'FAQ'), icon: HelpCircle },
    { path: '/contact', label: t('تواصل معنا', 'Contact'), icon: Mail },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950">
      {/* Top Bar */}
      <div className="bg-navy-900 text-white text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone size={12} />
              <span dir="ltr">+971 4 XXX XXXX</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Mail size={12} />
              info@elitevisa.demo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(state.lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 hover:text-gold-400 transition-colors"
              aria-label="Switch language"
            >
              <Globe size={14} />
              <span>{state.lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
            <button
              onClick={() => setTheme(state.theme === 'light' ? 'dark' : 'light')}
              className="hover:text-gold-400 transition-colors"
              aria-label="Toggle theme"
            >
              {state.theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white dark:bg-navy-900 shadow-md sticky top-0 z-50 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                <Plane size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-navy-900 dark:text-white text-lg leading-tight">
                  {t('سفريات النخبة', 'Elite Visa')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {t('خدمات التأشيرات والسفر', 'Visa & Travel Services')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Services Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  {t('جميع الخدمات', 'All Services')}
                  <ChevronDown size={14} />
                </button>
                {servicesOpen && (
                  <div className={`absolute top-full mt-1 ${isRTL ? 'left-0' : 'right-0'} bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-slate-200 dark:border-navy-700 p-2 min-w-[220px] z-50`}>
                    {SERVICES.slice(0, 5).map(service => (
                      <Link
                        key={service.id}
                        to={`/services/${service.id}`}
                        onClick={() => setServicesOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        {service.name[state.lang]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              {state.isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={state.currentUser?.role === 'admin' ? '/admin' : state.currentUser?.role === 'agency_owner' ? '/agency' : '/dashboard'}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
                  >
                    <User size={16} />
                    {state.currentUser?.name}
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg">
                    {t('تسجيل الدخول', 'Login')}
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                    {t('إنشاء حساب', 'Register')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-4">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-slate-200 dark:border-navy-700" />
              {SERVICES.slice(0, 5).map(service => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  {service.name[state.lang]}
                </Link>
              ))}
              <hr className="my-2 border-slate-200 dark:border-navy-700" />
              {state.isAuthenticated ? (
                <>
                  <Link
                    to={state.currentUser?.role === 'admin' ? '/admin' : state.currentUser?.role === 'agency_owner' ? '/agency' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400"
                  >
                    <User size={16} />
                    {t('لوحة التحكم', 'Dashboard')}
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600">
                    <LogOut size={16} />
                    {t('تسجيل الخروج', 'Logout')}
                  </button>
                </>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-slate-300 dark:border-navy-700 rounded-lg">
                    {t('دخول', 'Login')}
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg">
                    {t('تسجيل', 'Register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                  <Plane size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg">{t('سفريات النخبة', 'Elite Visa')}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t(
                  'منصة خدمات مستقلة تساعد في إعداد وتنسيق طلبات التأشيرات والسفر. القرار النهائي يعود للجهات الرسمية.',
                  'An independent service platform assisting with visa and travel application preparation. Final decisions rest with official authorities.'
                )}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('خدماتنا', 'Our Services')}</h4>
              <ul className="space-y-2">
                {SERVICES.slice(0, 5).map(s => (
                  <li key={s.id}>
                    <Link to={`/services/${s.id}`} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">
                      {s.name[state.lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('روابط مهمة', 'Quick Links')}</h4>
              <ul className="space-y-2">
                <li><Link to="/track" className="text-slate-400 hover:text-emerald-400 text-sm">{t('تتبع الطلب', 'Track Application')}</Link></li>
                <li><Link to="/agency-info" className="text-slate-400 hover:text-emerald-400 text-sm">{t('للوكالات', 'For Agencies')}</Link></li>
                <li><Link to="/faq" className="text-slate-400 hover:text-emerald-400 text-sm">{t('الأسئلة الشائعة', 'FAQ')}</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-emerald-400 text-sm">{t('سياسة الخصوصية', 'Privacy Policy')}</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-emerald-400 text-sm">{t('الشروط والأحكام', 'Terms & Conditions')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('تواصل معنا', 'Contact Us')}</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Phone size={14} /><span dir="ltr">+971 4 XXX XXXX</span></li>
                <li className="flex items-center gap-2"><Mail size={14} />info@elitevisa.demo</li>
                <li className="flex items-center gap-2"><Shield size={14} />{t('دعم واتساب متاح', 'WhatsApp support available')}</li>
              </ul>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Building2 size={12} />
                <span>{t('مرخصة ومسجلة', 'Licensed & Registered')}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-navy-800 mt-8 pt-6 text-center text-xs text-slate-500">
            <p>{t('© 2024 سفريات النخبة. جميع الحقوق محفوظة. منصة خدمات مستقلة - ليست جهة حكومية رسمية.', '© 2024 Elite Visa. All rights reserved. Independent service platform - not an official government entity.')}</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/9714XXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <MessageCircle size={24} className="text-white" />
      </a>
    </div>
  );
}

// ============================================
// Shared UI Components
// ============================================

export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    secondary: 'bg-navy-900 hover:bg-navy-800 text-white dark:bg-navy-700 dark:hover:bg-navy-600',
    outline: 'border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, color = 'default', className = '' }: { children: React.ReactNode; color?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'; className?: string }) {
  const colors = {
    default: 'bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function Input({ label, error, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <input
        className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, options, className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <select
        className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <textarea
        className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Stepper({ steps, currentStep, lang }: { steps: string[]; currentStep: number; lang: 'ar' | 'en' }) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              idx < currentStep ? 'bg-emerald-600 text-white' :
              idx === currentStep ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900' :
              'bg-slate-200 dark:bg-navy-700 text-slate-500 dark:text-slate-400'
            }`}>
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            <span className={`text-[10px] sm:text-xs text-center max-w-[80px] ${
              idx <= currentStep ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'
            }`}>
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${idx < currentStep ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-navy-700'}`} />
          )}
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
      <div className="relative bg-white dark:bg-navy-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status, lang }: { status: string; lang: 'ar' | 'en' }) {
  const statusLabels: Record<string, { ar: string; en: string }> = {
    draft: { ar: 'مسودة', en: 'Draft' },
    submitted: { ar: 'مُقدَّم', en: 'Submitted' },
    document_review: { ar: 'مراجعة المستندات', en: 'Document Review' },
    processing: { ar: 'قيد المعالجة', en: 'Processing' },
    verified: { ar: 'تم التحقق', en: 'Verified' },
    approved_for_payment: { ar: 'معتمد للدفع', en: 'Approved for Payment' },
    payment_pending: { ar: 'بانتظار الدفع', en: 'Payment Pending' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
  };
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    document_review: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-purple-100 text-purple-700',
    verified: 'bg-emerald-100 text-emerald-700',
    approved_for_payment: 'bg-green-100 text-green-700',
    payment_pending: 'bg-orange-100 text-orange-700',
    completed: 'bg-emerald-600 text-white',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-200 text-gray-600',
  };
  const label = statusLabels[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
      {label ? label[lang] : status}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );
}
