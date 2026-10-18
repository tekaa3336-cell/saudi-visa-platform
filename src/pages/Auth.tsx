import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../store';
import { Card, Button, Input } from '../components/Layout';
import { Plane, Eye, EyeOff, AlertCircle, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { signUpWithEmail, resendConfirmationEmail, sendAdminOtp } from '../lib/auth';

const OTP_RESEND_SECONDS = 60;

export function LoginPage() {
  const { login, verifyOtp, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Step 2 (admins only): the code emailed after the password was accepted
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const validateForm = () => {
    if (!email.trim()) return t('البريد الإلكتروني مطلوب', 'Email is required');
    if (!password.trim()) return t('كلمة المرور مطلوبة', 'Password is required');
    return null;
  };

  const goAfterLogin = (role: string) => {
    if (role === 'admin') return navigate('/admin', { replace: true });
    if (from && from.startsWith('/')) return navigate(from, { replace: true });
    navigate(role === 'agency_owner' ? '/agency' : '/dashboard', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setTouched({ email: true, password: true });
    setError('');
    setInfo('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(t(result.message.ar, result.message.en));
      return;
    }
    if ('otpRequired' in result) {
      setOtpEmail(result.email);
      setCode('');
      setCooldown(OTP_RESEND_SECONDS);
      return;
    }
    goAfterLogin(result.user.role);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !otpEmail) return;
    setError('');
    setInfo('');
    setSubmitting(true);
    const result = await verifyOtp(otpEmail, code);
    setSubmitting(false);
    if (!result.ok) {
      setError(t(result.message.ar, result.message.en));
      return;
    }
    goAfterLogin(result.user.role);
  };

  const handleResend = async () => {
    if (!otpEmail || cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    const result = await sendAdminOtp(otpEmail);
    setResending(false);
    if (result.ok) {
      setCooldown(OTP_RESEND_SECONDS);
      setInfo(t('أرسلنا رمزاً جديداً إلى بريدك الإلكتروني', 'We sent a new code to your email'));
    } else {
      setError(t(result.message.ar, result.message.en));
    }
  };

  const backToPassword = () => {
    setOtpEmail(null);
    setCode('');
    setPassword('');
    setError('');
    setInfo('');
  };

  if (otpEmail) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 animate-fade-in">
        <Card className="w-full max-w-sm p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mb-3"><ShieldCheck size={20} className="text-white" /></div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('التحقق بخطوتين', 'Two-step verification')}</h1>
            <p className="text-xs text-slate-500 mt-2">
              {t('أرسلنا رمز تحقق إلى', 'We sent a verification code to')} <span dir="ltr" className="font-medium text-slate-700 dark:text-slate-300">{otpEmail}</span>
              <br />{t('أدخله لإكمال تسجيل الدخول. يلزم رمز جديد في كل مرة.', 'Enter it to finish signing in. A new code is required every time.')}
            </p>
          </div>
          <form onSubmit={handleVerify} className="space-y-3">
            <Input
              label={t('رمز التحقق', 'Verification code')}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              dir="ltr"
              className="text-center tracking-[0.4em] text-lg"
              autoFocus
              required
            />
            {info && <div role="status" className="flex items-start gap-1.5 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded text-xs text-emerald-700"><CheckCircle2 size={12} className="mt-0.5 shrink-0" />{info}</div>}
            {error && <div role="alert" className="flex items-start gap-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600"><AlertCircle size={12} className="mt-0.5 shrink-0" />{error}</div>}
            <Button type="submit" className="w-full" disabled={submitting || code.length < 6}>{submitting ? t('جارٍ التحقق...', 'Verifying...') : t('تأكيد ودخول', 'Verify & sign in')}</Button>
          </form>
          <div className="flex items-center justify-between mt-4 text-xs">
            <button type="button" onClick={backToPassword} className="text-slate-500 hover:text-slate-700">{t('رجوع', 'Back')}</button>
            <button type="button" onClick={handleResend} disabled={cooldown > 0 || resending} className="text-emerald-600 font-medium disabled:text-slate-400">
              {cooldown > 0 ? t(`إعادة الإرسال بعد ${cooldown} ث`, `Resend in ${cooldown}s`) : t('إعادة إرسال الرمز', 'Resend code')}
            </button>
          </div>
        </Card>
      </div>
    );
  }

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
          {error && <div role="alert" className="flex items-start gap-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600"><AlertCircle size={12} className="mt-0.5 shrink-0" />{error}</div>}
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? t('جارٍ الدخول...', 'Signing in...') : t('دخول', 'Sign In')}</Button>
        </form>
        <p className="text-xs text-slate-500 text-center mt-4">{t('ليس لديك حساب؟', 'No account?')} <Link to="/register" className="text-emerald-600 font-medium">{t('سجّل', 'Register')}</Link></p>
      </Card>
    </div>
  );
}

const RESEND_COOLDOWN_SECONDS = 60;

export function RegisterPage() {
  const { t } = useApp();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [type, setType] = useState<'customer' | 'agency'>('customer');
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  // Set once the account was created: the email address the confirmation link was sent to
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resendNote, setResendNote] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const getError = (field: keyof typeof form) => {
    if (!touched[field]) return undefined;
    switch (field) {
      case 'name':
        return !form.name.trim() ? t('الاسم مطلوب', 'Name is required') : undefined;
      case 'email':
        if (!form.email.trim()) return t('البريد الإلكتروني مطلوب', 'Email is required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return t('البريد الإلكتروني غير صحيح', 'Invalid email');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setTouched({ name: true, email: true, password: true, confirm: true });
    setError('');

    // Validate all fields
    if (!form.name.trim()) { setError(t('الاسم مطلوب', 'Name is required')); return; }
    if (!form.email.trim()) { setError(t('البريد الإلكتروني مطلوب', 'Email is required')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError(t('البريد الإلكتروني غير صحيح', 'Invalid email')); return; }
    if (form.password.length < 6) { setError(t('6 أحرف على الأقل', 'Min 6 characters')); return; }
    if (form.password !== form.confirm) { setError(t('كلمات المرور غير متطابقة', 'Passwords mismatch')); return; }

    // Create the account in Supabase; the user must confirm their email before they can sign in
    setSubmitting(true);
    const result = await signUpWithEmail({
      name: form.name,
      email: form.email,
      password: form.password,
      accountType: type,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(t(result.message.ar, result.message.en));
      return;
    }

    setForm(f => ({ ...f, password: '', confirm: '' }));
    setSentTo(form.email.trim().toLowerCase());
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleResend = async () => {
    if (!sentTo || cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setResendNote(null);
    const result = await resendConfirmationEmail(sentTo);
    setResendNote(
      result.ok
        ? { ok: true, text: t('تمت إعادة إرسال رسالة التأكيد', 'Confirmation email sent again') }
        : { ok: false, text: t(result.message.ar, result.message.en) },
    );
  };

  // After a successful sign-up: tell the user to confirm their email before signing in
  if (sentTo) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 animate-fade-in">
        <Card className="w-full max-w-sm p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
            <Mail size={26} className="text-emerald-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('تحقق من بريدك الإلكتروني', 'Check your email')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
            {t('تم إنشاء حسابك بنجاح. أرسلنا رابط التأكيد إلى:', 'Your account was created. We sent a confirmation link to:')}
          </p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 break-all" dir="ltr">{sentTo}</p>
          <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-start mb-3">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              {t(
                'انتقل إلى بريدك الإلكتروني واضغط على رابط التأكيد لتفعيل حسابك قبل تسجيل الدخول.',
                'Go to your email inbox and click the confirmation link to activate your account before signing in.',
              )}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            {t('لم تصلك الرسالة؟ تحقق من مجلد الرسائل غير المرغوبة (Spam).', "Didn't get the email? Check your spam folder.")}
          </p>
          {type === 'agency' && (
            <div className="p-2 mb-3 bg-amber-50 dark:bg-amber-900/20 rounded text-[10px] text-amber-700 dark:text-amber-400">
              {t('سيتم مراجعة طلب الوكالة بعد تأكيد البريد', 'The agency request will be reviewed after email confirmation')}
            </div>
          )}
          {resendNote && (
            <div role="status" className={`flex items-start gap-1.5 p-2 mb-3 rounded text-xs text-start ${resendNote.ok ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
              {!resendNote.ok && <AlertCircle size={12} className="mt-0.5 shrink-0" />}{resendNote.text}
            </div>
          )}
          <div className="space-y-2">
            <Link to="/login"><Button className="w-full">{t('الانتقال إلى تسجيل الدخول', 'Go to Sign In')}</Button></Link>
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={handleResend} disabled={cooldown > 0}>
              {cooldown > 0
                ? t(`إعادة إرسال رسالة التأكيد (${cooldown})`, `Resend confirmation email (${cooldown})`)
                : t('إعادة إرسال رسالة التأكيد', 'Resend confirmation email')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
          {error && <div role="alert" className="flex items-start gap-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600"><AlertCircle size={12} className="mt-0.5 shrink-0" />{error}</div>}
          {type === 'agency' && <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-[10px] text-amber-700 dark:text-amber-400">{t('سيتم مراجعة طلب الوكالة', 'Agency request will be reviewed')}</div>}
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? t('جارٍ الإنشاء...', 'Creating...') : t('إنشاء', 'Create')}</Button>
        </form>
        <p className="text-xs text-slate-500 text-center mt-3">{t('لديك حساب؟', 'Have account?')} <Link to="/login" className="text-emerald-600 font-medium">{t('دخول', 'Login')}</Link></p>
      </Card>
    </div>
  );
}
