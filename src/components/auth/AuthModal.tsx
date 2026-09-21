import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    login,
    register,
    siteConfig,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab);
      setLoginError('');
      setRegError('');
    }
  }, [isAuthModalOpen, authModalTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const result = login(loginEmail, loginPassword);
    setIsLoggingIn(false);

    if (!result.success) {
      setLoginError(result.error || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setIsRegistering(true);
    const result = register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      default_address: regAddress,
      password: regPassword,
    });
    setIsRegistering(false);

    if (!result.success) {
      setRegError(result.error || 'Failed to create account.');
    }
  };

  const quickFill = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        id="auth-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              {siteConfig.restaurant_name ? siteConfig.restaurant_name.charAt(0) : 'F'}
            </div>
            <div>
              <h2 id="auth-modal-title" className="font-semibold text-stone-100 text-base leading-tight">
                {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-stone-400">
                {activeTab === 'login'
                  ? 'Sign in to access your profile & orders'
                  : 'Register for faster checkout & live tracking'}
              </p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={closeAuthModal}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 pb-2 border-b border-stone-800/60 flex gap-2 bg-stone-900/30">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'login' ? (
            /* --- SIGN IN FORM --- */
            <form id="auth-login-form" onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div
                  id="auth-login-error"
                  className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. asmuhammad42@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-stone-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-stone-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="auth-login-submit-btn"
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-semibold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Instant Test Accounts for seamless evaluation */}
              <div className="pt-2 border-t border-stone-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Quick Role Testing (1-Click)
                  </span>
                  <span className="text-[10px] text-stone-500">Click to autofill</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Admin Demo Button */}
                  <button
                    type="button"
                    id="auth-demo-admin-btn"
                    onClick={() => quickFill('asmuhammad42@gmail.com', 'admin123')}
                    className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-300">Muhammad</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                        Admin
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 group-hover:text-stone-300 truncate">
                      asmuhammad42@gmail.com
                    </div>
                    <div className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Unlocks Admin Portal
                    </div>
                  </button>

                  {/* Customer Demo Button */}
                  <button
                    type="button"
                    id="auth-demo-customer-btn"
                    onClick={() => quickFill('adeola@example.com', 'customer123')}
                    className="p-2.5 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/80 text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-200">Adeola</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-700 text-stone-300 font-semibold uppercase">
                        Customer
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 group-hover:text-stone-300 truncate">
                      adeola@example.com
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                      <UserIcon className="w-3 h-3" /> No Admin Access
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* --- CREATE ACCOUNT FORM --- */
            <form id="auth-register-form" onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div
                  id="auth-register-error"
                  className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="reg-name">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Adeola Davies"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-stone-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="reg-email">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-stone-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="reg-phone">
                    Phone (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                      id="reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0803 123 4567"
                      className="w-full pl-9 pr-2 py-2 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder-stone-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="reg-password">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-2 py-2 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder-stone-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="reg-address">
                  Default Delivery Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                  <textarea
                    id="reg-address"
                    rows={2}
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Street, apartment / office, landmark"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-stone-600 resize-none"
                  />
                </div>
              </div>

              {/* Role explanation */}
              <div className="p-2.5 rounded-xl bg-stone-800/40 border border-stone-800 text-[11px] text-stone-400 flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  New accounts are created with standard <strong className="text-stone-200">Customer</strong> permissions.
                  Administrative privileges are restricted exclusively to authorized restaurant personnel.
                </span>
              </div>

              <button
                id="auth-register-submit-btn"
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-semibold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isRegistering ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-stone-950/60 border-t border-stone-800 text-center text-xs text-stone-500">
          {activeTab === 'login' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 ml-1"
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 ml-1"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
