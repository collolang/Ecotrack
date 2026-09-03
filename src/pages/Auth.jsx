import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff, User, ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import SEO from '../components/SEO';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const toast = useToast();

  const mode = searchParams.get('mode') || 'login';
  const [tab, setTab] = useState(mode === 'forgot' ? 'forgot' : (mode === 'register' ? 'register' : 'login'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Login password strength
  const [loginPasswordRules, setLoginPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const loginAllValid = Object.values(loginPasswordRules).every(Boolean);

  // Register form
  const [regData, setRegData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConf, setShowRegConf] = useState(false);
  const [termsAccepted, setTerms] = useState(false);
  
  // Password strength validation for register
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  // Name validation for register
  const [nameRules, setNameRules] = useState({
    firstNameValid: true,
    lastNameValid: true
  });

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [recoveryQuestions, setRecoveryQuestions] = useState([]);
  const [recoveryAnswers, setRecoveryAnswers] = useState([]);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [showRecoveryPass, setShowRecoveryPass] = useState(false);
  const [showRecoveryConf, setShowRecoveryConf] = useState(false);
  const [recoveryPasswordRules, setRecoveryPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const recoveryAllValid = Object.values(recoveryPasswordRules).every(Boolean);
  const recoveryPasswordsMatch = recoveryPassword === recoveryConfirmPassword;

  const allPasswordValid = Object.values(passwordRules).every(Boolean);

  const validatePassword = useCallback((password) => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return {
      length: hasLength,
      uppercase: hasUpper,
      lowercase: hasLower,
      number: hasNumber,
      special: hasSpecial
    };
  }, []);

  const validateName = useCallback((name) => {
    const trimmed = name.trim();
    const isValidFormat = /^[a-zA-Z\s\-']+$/i.test(trimmed);
    return isValidFormat && trimmed.length >= 2;
  }, []);

  const switchTab = (t) => { 
    setTab(t); 
    setError(''); 
    if (t !== 'forgot') setForgotStep(1);
    setRecoveryQuestions([]);
    setRecoveryAnswers([]);
    setError('');
  };

  useEffect(() => {
    if (tab === 'login') {
      try {
        const saved = localStorage.getItem('loginCredentials');
        if (saved) {
          const { email, password, remember } = JSON.parse(saved);
          setLoginData({ email, password });
          setRememberMe(remember || false);
        }
      } catch {
        localStorage.removeItem('loginCredentials');
      }
    }
  }, [tab]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginAllValid) {
      toast.error('Password must meet all strength requirements.');
      setError('Password must meet all strength requirements.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      if (rememberMe) {
        try {
          localStorage.setItem('loginCredentials', JSON.stringify({
            email: loginData.email,
            password: loginData.password,
            remember: true
          }));
        } catch {}
      } else {
        localStorage.removeItem('loginCredentials');
      }
      toast.success('Welcome back! 🌿');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (!nameRules.firstNameValid || !nameRules.lastNameValid) {
      toast.error('Name fields must only contain letters, spaces, hyphens, apostrophes and be at least 2 characters.');
      setError('Name fields must only contain letters, spaces, hyphens, apostrophes and be at least 2 characters.');
      return;
    }
    if (!allPasswordValid) {
      toast.error('Password must meet all strength requirements.');
      setError('Password must meet all strength requirements.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      toast.error('Passwords do not match.');
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions.');
      setError('Please accept the Terms & Conditions.');
      return;
    }
    setLoading(true);
    try {
      await register({
        firstName: regData.firstName,
        lastName: regData.lastName,
        email: regData.email,
        password: regData.password,
      });
      toast.success('Account created! Welcome to EcoTrack 🌿');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const handleRecoveryQuestions = async (e) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = forgotEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      toast.error('Please enter a valid email address.');
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.getSecurityQuestions(normalizedEmail);
      const rawQuestions = data?.questions || data;
      const returnedQuestions = Array.isArray(rawQuestions) ? rawQuestions.map(item => item.question || item) : rawQuestions;
      if (!Array.isArray(returnedQuestions) || returnedQuestions.length !== 3) {
        setError('If this account exists, verify below. We could not start recovery right now.');
        return;
      }
      setRecoveryQuestions(returnedQuestions);
      setRecoveryAnswers(returnedQuestions.map(() => ''));
      setForgotEmail(normalizedEmail);
      setForgotStep(2);
    } catch (err) {
      const errorMsg = err.status === 404 || err.code === 'ACCOUNT_NOT_FOUND' || err.code === 'NO_SECURITY_QUESTIONS'
        ? 'If this account exists, verify below.'
        : (err.message || 'If this account exists, verify below.');
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionReset = async (e) => {
    e.preventDefault();
    setError('');
    if (recoveryAnswers.some(answer => !answer.trim())) {
      setError('Please answer all three security questions.');
      return;
    }
    if (!recoveryAllValid) {
      toast.error('New password must meet all strength requirements.');
      setError('New password must meet all strength requirements.');
      return;
    }
    if (!recoveryPasswordsMatch) {
      toast.error('Passwords do not match.');
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPasswordWithQuestions({
        email: forgotEmail.trim().toLowerCase(),
        answers: recoveryQuestions.map((question, index) => ({
          question,
          answer: recoveryAnswers[index].trim(),
        })),
         newPassword: recoveryPassword,
      });
      setError('');
      toast.success('Password reset successful. Redirecting to login...');
      setForgotStep(3);
      window.setTimeout(() => switchTab('login'), 3000);
    } catch (err) {
      const isCooldown = err.status === 429 || err.code === 'RECOVERY_COOLDOWN' || err.code === 'TOO_MANY_ATTEMPTS';
      const isInvalidAnswers = err.code === 'INVALID_SECURITY_ANSWERS' || err.code === 'SECURITY_ANSWERS_MISMATCH';
      const errorMsg = isCooldown
        ? 'Too many failed attempts. Please try again later.'
        : isInvalidAnswers
          ? 'The answers do not match the security questions saved for this account.'
          : err.message || 'The answers could not be verified. Please check them and try again.';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <SEO path="/auth" title="Sign In" noindex />
      <div className="w-full max-w-md page-enter">

        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-leaf-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">EcoTrack</h1>
          <p className="text-slate-500 text-sm mt-1">
            {tab === 'login' ? 'Sign in to your account' : 
             tab === 'register' ? 'Create your free account' :
             tab === 'forgot' ? 'Recover your account' : 'Set your new password'}
          </p>
        </div>

        {/* Tab switcher (only show Login & Register by default) */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-100 rounded-xl p-1 mb-6">
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`py-2.5 rounded-lg font-semibold text-xs md:text-sm capitalize transition-all duration-200 ${
                tab === t ? 'bg-white text-leaf-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-7">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email" required
                    value={loginData.email}
                    onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showLoginPass ? 'text' : 'password'} required
                    value={loginData.password}
                    onChange={e => {
                      const newPassword = e.target.value;
                      setLoginData(p => ({ ...p, password: newPassword }));
                      const rules = validatePassword(newPassword);
                      setLoginPasswordRules(rules);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowLoginPass(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Login Password Rules */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${loginPasswordRules.length ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {loginPasswordRules.length ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={loginPasswordRules.length ? 'text-slate-700 font-medium' : 'text-slate-500'}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${loginPasswordRules.uppercase ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {loginPasswordRules.uppercase ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={loginPasswordRules.uppercase ? 'text-slate-700 font-medium' : 'text-slate-500'}>One uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${loginPasswordRules.lowercase ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {loginPasswordRules.lowercase ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={loginPasswordRules.lowercase ? 'text-slate-700 font-medium' : 'text-slate-500'}>One lowercase letter (a-z)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${loginPasswordRules.number ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {loginPasswordRules.number ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={loginPasswordRules.number ? 'text-slate-700 font-medium' : 'text-slate-500'}>One number (0-9)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${loginPasswordRules.special ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {loginPasswordRules.special ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={loginPasswordRules.special ? 'text-slate-700 font-medium' : 'text-slate-500'}>One special character (!@#$%^&*() etc.)</span>
                </div>
              </div>
              {/* ------------------------------------------------------------------------------------------------------- */}
              <div className="flex items-center justify-end text-sm">
                <button type="button" onClick={() => switchTab('forgot')} className="text-leaf-600 hover:text-leaf-700 font-semibold">
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit" disabled={!loginAllValid || loading}
                className="w-full bg-leaf-600 hover:bg-leaf-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                {loading ? 'Signing in…' : 'Login'}
              </button>
              <p className="text-center text-sm text-slate-500">
                No account?{' '}
                <button type="button" onClick={() => switchTab('register')} className="text-leaf-600 font-semibold hover:text-leaf-700">
                  Register here →
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text" required
                      value={regData.firstName}
                      onChange={e => {
                        const val = e.target.value;
                        setRegData(p => ({ ...p, firstName: val }));
                        setNameRules(r => ({ ...r, firstNameValid: validateName(val) }));
                      }}
                      placeholder="Collins"
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        !nameRules.firstNameValid && regData.firstName.trim()
                          ? 'border-red-300 ring-red-200 bg-red-50 focus:ring-red-500' 
                          : 'border-slate-200 focus:ring-leaf-500'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text" required
                      value={regData.lastName}
                      onChange={e => {
                        const val = e.target.value;
                        setRegData(p => ({ ...p, lastName: val }));
                        setNameRules(r => ({ ...r, lastNameValid: validateName(val) }));
                      }}
                      placeholder="Kiprono"
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        !nameRules.lastNameValid && regData.lastName.trim()
                          ? 'border-red-300 ring-red-200 bg-red-50 focus:ring-red-500' 
                          : 'border-slate-200 focus:ring-leaf-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email" required
                    value={regData.email}
                    onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showRegPass ? 'text' : 'password'} required
                    value={regData.password}
                    onChange={e => {
                      const newPassword = e.target.value;
                      setRegData(p => ({ ...p, password: newPassword }));
                      const rules = validatePassword(newPassword);
                      setPasswordRules(rules);
                    }}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition-all"
                  />
                  <button type="button" onClick={() => setShowRegPass(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Password Rules */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${passwordRules.length ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {passwordRules.length ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={passwordRules.length ? 'text-slate-700 font-medium' : 'text-slate-500'}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${passwordRules.uppercase ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {passwordRules.uppercase ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={passwordRules.uppercase ? 'text-slate-700 font-medium' : 'text-slate-500'}>One uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${passwordRules.lowercase ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {passwordRules.lowercase ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={passwordRules.lowercase ? 'text-slate-700 font-medium' : 'text-slate-500'}>One lowercase letter (a-z)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${passwordRules.number ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {passwordRules.number ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={passwordRules.number ? 'text-slate-700 font-medium' : 'text-slate-500'}>One number (0-9)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-sm ${passwordRules.special ? 'text-green-500 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                    {passwordRules.special ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                  <span className={passwordRules.special ? 'text-slate-700 font-medium' : 'text-slate-500'}>One special character (!@#$%^&*() etc.)</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showRegConf ? 'text' : 'password'} required
                    value={regData.confirmPassword}
                    onChange={e => setRegData(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition-all"
                  />
                  <button type="button" onClick={() => setShowRegConf(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showRegConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* --------------------------------------------------------------------------------------------- */}
              <label className="flex items-start gap-2.5 text-sm cursor-pointer text-slate-600">
                <input type="checkbox" checked={termsAccepted} onChange={e => setTerms(e.target.checked)} className="accent-leaf-600 w-4 h-4 mt-0.5 shrink-0" />
                I agree to the{' '}
                <a href="#" className="text-leaf-600 hover:text-leaf-700 font-semibold">Terms & Conditions</a>
              </label>
              {/* ----------------------------------------------------------------------------------------------------------- */}
              <button
                type="submit" disabled={!(nameRules.firstNameValid && nameRules.lastNameValid && allPasswordValid) || loading}
                className="w-full bg-leaf-600 hover:bg-leaf-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <p className="text-center text-sm text-slate-500">
                Have an account?{' '}
                <button type="button" onClick={() => switchTab('login')} className="text-leaf-600 font-semibold hover:text-leaf-700">
                  Login here →
                </button>
              </p>
            </form>
          )}
          {/* ── SECURITY QUESTION RECOVERY ── */}
          {tab === 'forgot' && forgotStep === 1 && (
            <form onSubmit={handleRecoveryQuestions} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500">If this account exists, you will be asked to verify below.</p>
              <button type="submit" disabled={loading} className="w-full bg-leaf-600 hover:bg-leaf-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                {loading ? 'Checking...' : 'Continue'}
              </button>
              <p className="text-center text-sm text-slate-500">
                <button type="button" onClick={() => switchTab('login')} className="text-leaf-600 font-semibold hover:text-leaf-700">
                  ← Back to Login
                </button>
              </p>
            </form>
          )}

          {tab === 'forgot' && forgotStep === 2 && (
            <form onSubmit={handleQuestionReset} className="space-y-5">
              {recoveryQuestions.map((question, index) => (
                <div key={`${question}-${index}`}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{question}</label>
                  <input type="password" required value={recoveryAnswers[index]} onChange={e => setRecoveryAnswers(current => current.map((answer, answerIndex) => answerIndex === index ? e.target.value : answer))} autoComplete="off" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500" />
                </div>
              ))}
              <input type="password" required value={recoveryPassword} onChange={e => { setRecoveryPassword(e.target.value); setRecoveryPasswordRules(validatePassword(e.target.value)); }} placeholder="New password" autoComplete="new-password" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500" />
              <input type="password" required value={recoveryConfirmPassword} onChange={e => setRecoveryConfirmPassword(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500" />
              {!recoveryPasswordsMatch && recoveryConfirmPassword && <p className="text-xs text-red-600">Passwords do not match.</p>}
              <p className="text-xs text-slate-500">Password needs 8+ characters, uppercase and lowercase letters, a number, and a special character.</p>
              <button type="submit" disabled={!recoveryAllValid || !recoveryPasswordsMatch || loading} className="w-full bg-leaf-600 hover:bg-leaf-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                {loading ? 'Verifying...' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setForgotStep(1)} className="w-full text-leaf-600 font-semibold text-sm">← Use a different email</button>
            </form>
          )}

          {tab === 'forgot' && forgotStep === 3 && (
            <div className="text-center py-10">
              <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Password reset successful</h3>
              <p className="text-sm text-slate-500">You will return to the login screen shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
