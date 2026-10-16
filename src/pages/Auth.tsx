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
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateForm = () => {
    if (!email.trim()) return t('البريد الإلكتروني مطلوب', 'Email is required');
    if (!password.trim()) return t('كلمة المرور مطلوبة', 'Password is required');
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError(t('بيانات غير صحيحة. جرب حساب تجريبي.', 'Invalid. Try demo account.'));
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 animate-fade-in">
      <Card className="w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mb-3"><Plane size={20} className="text-white" /></div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('تسجيل الدخول', 'Sign In')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input 
            label={t('البريد', 'Email')} 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            onBlur={() => setTouched({...touched, email: true})}
            placeholder="email@example.com" 
            error={touched.email && !email.trim() ? t('البريد الإلكتروني مطلوب', 'Email is required') : undefined}
            required 
          />
          <div className="relative">
            <Input 
              label={t('كلمة المرور', 'Password')} 
              type={showPw ? 'text' : 'password'} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              onBlur={() => setTouched({...touched, password: true})}
              placeholder="••••••" 
              error={touched.password && !password.trim() ? t('كلمة المرور مطلوبة', 'Password is required') : undefined}
              required 
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute top-8 end-3 text-slate-400">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
          </div>
          {error && <div className="flex items-center gap-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600"><AlertCircle size={12} />{error}</div>}
          <Button type="submit" className="w-full">{t('دخول', 'Sign In')}</Button>
        </form>
        <p className="text-xs text-slate-500 text-center mt-4">{t('ليس لديك حساب؟', 'No account?')} <Link to="/register" className="text-emerald-600 font-medium">{t('سجّل', 'Register')}</Link></p>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">{t('حسابات تجريبية', 'Demo Accounts')}</p>
          <div className="space-y-1">
            {[
              { email: 'customer@demo.com', label: t('عميل', 'Customer') },
              { email: 'agency@demo.com', label: t('وكالة', 'Agency') },
              { email: 'admin@demo.com', label: t('مدير', 'Admin') },
            ].map(d => (
              <button key={d.email} onClick={() => { setEmail(d.email); setPassword('demo123'); }}
                className="w-full flex justify-between p-1.5 rounded text-[10px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="font-medium">{d.label}</span><span className="text-slate-500" dir="ltr">{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const { login, state, t } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [type, setType] = useState<'customer' | 'agency'>('customer');
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });

  const getError = (field: keyof typeof form) => {
    if (!touched[field]) return undefined;
    switch (field) {
      case 'name':
        return !form.name.trim() ? t('الاسم مطلوب', 'Name is required') : undefined;
      case 'email':
        if (!form.email.trim()) return t('البريد الإلكتروني مطلوب', 'Email is required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('البريد الإلكتروني غير صحيح', 'Invalid email');
        return undefined;
      case 'password':
        if (!form.password) return t('كلمة المرور مطلوبة', 'Password is required');
        if (form.password.length < 6) return t('6 أحرف على الأقل', 'Min 6 characters');
        return undefined;
      case 'confirm':
        if (!form.confirm) return t('تأكيد كلمة المرور مطلوب', 'Password confirmation is required');
        if (form.password !== form.confirm) return t('كلمات المرور غير متطابقة', 'Passwords mismatch');
        return undefined;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    setError('');
    
    // Validate all fields
    if (!form.name.trim()) { setError(t('الاسم مطلوب', 'Name is required')); return; }
    if (!form.email.trim()) { setError(t('البريد الإلكتروني مطلوب', 'Email is required')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(t('البريد الإلكتروني غير صحيح', 'Invalid email')); return; }
    if (form.password.length < 6) { setError(t('6 أحرف على الأقل', 'Min 6 characters')); return; }
    if (form.password !== form.confirm) { setError(t('كلمات المرور غير متطابقة', 'Passwords mismatch')); return; }
    
    // Login and save current preferences to user profile
    login('customer@demo.com', '');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 animate-fade-in">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-4">{t('إنشاء حساب', 'Register')}</h1>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => setType('customer')} className={`p-2 rounded-lg border-2 text-xs font-medium ${type === 'customer' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'border-slate-200 dark:border-slate-700 text-slate-600'}`}>{t('عميل', 'Individual')}</button>
          <button onClick={() => setType('agency')} className={`p-2 rounded-lg border-2 text-xs font-medium ${type === 'agency' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'border-slate-200 dark:border-slate-700 text-slate-600'}`}>{t('وكالة', 'Agency')}</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input 
            label={t('الاسم', 'Name')} 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})}
            onBlur={() => setTouched({...touched, name: true})}
            error={getError('name')}
            required 
          />
          <Input 
            label={t('البريد', 'Email')} 
            type="email" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})}
            onBlur={() => setTouched({...touched, email: true})}
            error={getError('email')}
            required 
          />
          <Input 
            label={t('كلمة المرور', 'Password')} 
            type="password" 
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})}
            onBlur={() => setTouched({...touched, password: true})}
            error={getError('password')}
            required 
          />
          <Input 
            label={t('تأكيد', 'Confirm')} 
            type="password" 
            value={form.confirm} 
            onChange={e => setForm({...form, confirm: e.target.value})}
            onBlur={() => setTouched({...touched, confirm: true})}
            error={getError('confirm')}
            required 
          />
          {error && <div className="flex items-center gap-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600"><AlertCircle size={12} />{error}</div>}
          {type === 'agency' && <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-[10px] text-amber-700 dark:text-amber-400">{t('سيتم مراجعة طلب الوكالة', 'Agency request will be reviewed')}</div>}
          <Button type="submit" className="w-full">{t('إنشاء', 'Create')}</Button>
        </form>
        <p className="text-xs text-slate-500 text-center mt-3">{t('لديك حساب؟', 'Have account?')} <Link to="/login" className="text-emerald-600 font-medium">{t('دخول', 'Login')}</Link></p>
      </Card>
    </div>
  );
}
