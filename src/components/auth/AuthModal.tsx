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
import { BrandLogo } from '../common/BrandLogo';

const MIN_PASSWORD_LENGTH = 6;

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    login,
    forgotPassword,
    register,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);

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
  const [confirmRegPassword, setConfirmRegPassword] = useState('');
  const [showConfirmRegPassword, setShowConfirmRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab);
      setLoginError('');
      setRegError('');
      setIsForgotPassword(false);
      setForgotError('');
      setForgotMessage('');
      setForgotEmail(loginEmail);
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await login(loginEmail, loginPassword);
      if (!result.success) {
        setLoginError(result.error || 'Invalid email or password.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setIsSendingResetLink(true);

    const emailToUse = forgotEmail || loginEmail;
    const result = await forgotPassword(emailToUse);

    setIsSendingResetLink(false);

    if (!result.success) {
      setForgotError(result.error || 'Unable to send reset instructions.');
      return;
    }

    setForgotMessage(
      result.message ||
        'If an account exists for this email, reset instructions have been sent.'
    );
    setForgotEmail(emailToUse);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword.length < MIN_PASSWORD_LENGTH) {
      setRegError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    if (regPassword !== confirmRegPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setIsRegistering(true);
    try {
      const result = await register({
        full_name: regName,
        email: regEmail,
        phone_number: regPhone,
        delivery_address: regAddress,
        password: regPassword,
      });
      if (result.success) {
        setActiveTab('login');
        setLoginEmail(regEmail);
        setLoginPassword('');
        setLoginError('Account created. Please sign in.');
      } else {
        setRegError(result.error || 'Failed to create account.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        id="auth-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden text-[#111827] flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFF8ED]">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showTagline={false} />
            <div>
              <h2 id="auth-modal-title" className="font-bold text-[#111827] text-base leading-tight">
                {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-[#475569]">
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
            className="p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#111827] hover:bg-white transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-[#E5E7EB] flex gap-2 bg-[#FFF8ED]/50">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
              activeTab === 'login'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111827] hover:bg-white'
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
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
              activeTab === 'register'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111827] hover:bg-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'login' ? (
            isForgotPassword ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {forgotError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#EF4444] text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{forgotMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1.5" htmlFor="login-forgot-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="login-forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. asmuhammad42@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSendingResetLink}
                    className="flex-1 py-2.5 px-4 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs rounded-xl transition shadow-sm shadow-[#C8102E]/20 disabled:opacity-60 cursor-pointer"
                  >
                    {isSendingResetLink ? 'Sending...' : 'Send reset link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotError('');
                      setForgotMessage('');
                    }}
                    className="px-3 py-2.5 text-xs font-medium text-[#475569] hover:text-[#111827] cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </form>
            ) : (
              /* --- SIGN IN FORM --- */
              <form id="auth-login-form" onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div
                    id="auth-login-error"
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#EF4444] text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1.5" htmlFor="login-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. asmuhammad42@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1.5" htmlFor="login-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#475569] cursor-pointer p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setForgotError('');
                      setForgotMessage('');
                      setIsForgotPassword(true);
                    }}
                    className="text-xs font-medium text-[#C8102E] hover:text-[#A70D26] transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  id="auth-login-submit-btn"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-sm rounded-xl transition shadow-md shadow-[#C8102E]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
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
              </form>
            )
          ) : (
            /* --- CREATE ACCOUNT FORM --- */
            <form id="auth-register-form" onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div
                  id="auth-register-error"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#EF4444] text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="reg-name">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Adeola Davies"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="reg-email">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="reg-phone">
                    Phone (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0803 123 4567"
                      className="w-full pl-9 pr-2 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="reg-password">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-10 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#475569] cursor-pointer p-1"
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="reg-confirm-password">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmRegPassword ? 'text' : 'password'}
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    value={confirmRegPassword}
                    onChange={(e) => setConfirmRegPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmRegPassword(!showConfirmRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#475569] cursor-pointer p-1"
                    aria-label={showConfirmRegPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="reg-address">
                  Default Delivery Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
                  <textarea
                    id="reg-address"
                    rows={2}
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Street, apartment / office, landmark"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] resize-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFF8ED] border border-[#E5E7EB] text-[11px] text-[#475569] flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>
                  New accounts are created with standard <strong className="text-[#111827]">Customer</strong> permissions.
                </span>
              </div>

              <button
                id="auth-register-submit-btn"
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 px-4 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-sm rounded-xl transition shadow-md shadow-[#C8102E]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
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
        <div className="p-3.5 bg-[#FFF8ED] border-t border-[#E5E7EB] text-center text-xs text-[#475569]">
          {activeTab === 'login' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                }}
                className="text-[#C8102E] hover:underline font-semibold ml-1 cursor-pointer"
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
                className="text-[#C8102E] hover:underline font-semibold ml-1 cursor-pointer"
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
