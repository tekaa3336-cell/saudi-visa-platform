import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store';
import { Card, Button, Input } from '../components/Layout';
import { Plane, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { login, t } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(t('بيانات الدخول غير صحيحة. جرب أحد الحسابات التجريبية.', 'Invalid credentials. Try a demo account.'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mb-4">
            <Plane size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('تسجيل الدخول', 'Sign In')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('أدخل بياناتك للوصول إلى لوحة التحكم', 'Enter your credentials to access your dashboard')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('البريد الإلكتروني', 'Email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
          <div className="relative">
            <Input
              label={t('كلمة المرور', 'Password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-9 end-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            {t('دخول', 'Sign In')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            {t('ليس لديك حساب؟', "Don't have an account?")}{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              {t('إنشاء حساب', 'Register')}
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-navy-700">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">{t('حسابات تجريبية', 'Demo Accounts')}</p>
          <div className="space-y-2">
            {[
              { email: 'customer@demo.com', label: t('عميل', 'Customer'), pass: 'demo123' },
              { email: 'agency@demo.com', label: t('وكالة', 'Agency'), pass: 'demo123' },
              { email: 'admin@demo.com', label: t('مدير', 'Admin'), pass: 'demo123' },
            ].map((demo) => (
              <button
                key={demo.email}
                onClick={() => { setEmail(demo.email); setPassword(demo.pass); }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-xs bg-slate-50 dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300">{demo.label}</span>
                <span className="text-slate-500" dir="ltr">{demo.email}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const { login, t } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState<'customer' | 'agency'>('customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t('كلمات المرور غير متطابقة', 'Passwords do not match'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'Password must be at least 6 characters'));
      return;
    }
    // In demo mode, just login with the customer account
    login('customer@demo.com', '');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('إنشاء حساب', 'Create Account')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('انضم إلينا لبدء طلبات التأشيرة', 'Join us to start your visa applications')}</p>
        </div>

        {/* Account Type */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setAccountType('customer')}
            className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
              accountType === 'customer' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('عميل فردي', 'Individual')}
          </button>
          <button
            onClick={() => setAccountType('agency')}
            className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
              accountType === 'agency' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('وكالة / B2B', 'Agency / B2B')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('الاسم الكامل', 'Full Name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label={t('البريد الإلكتروني', 'Email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label={t('رقم الهاتف', 'Phone')}
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+971..."
          />
          <Input
            label={t('كلمة المرور', 'Password')}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Input
            label={t('تأكيد كلمة المرور', 'Confirm Password')}
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {accountType === 'agency' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
              {t('سيتم مراجعة طلب الوكالة من قبل الإدارة قبل التفعيل. ستحصل على أسعار الجملة بعد الموافقة.', 'Agency registration will be reviewed by admin before activation. Wholesale pricing will be available after approval.')}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            {t('إنشاء الحساب', 'Create Account')}
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          {t('بتسجيلك، أنت توافق على', 'By registering, you agree to our')}{' '}
          <Link to="/terms" className="text-emerald-600 hover:underline">{t('الشروط والأحكام', 'Terms & Conditions')}</Link>
          {' '}{t('و', 'and')}{' '}
          <Link to="/privacy" className="text-emerald-600 hover:underline">{t('سياسة الخصوصية', 'Privacy Policy')}</Link>
        </p>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500">
            {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              {t('تسجيل الدخول', 'Sign In')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
