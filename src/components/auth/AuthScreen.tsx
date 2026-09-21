import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
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
  Clock,
  MessageCircle,
  ShoppingBag,
  Award,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const AuthScreen: React.FC = () => {
  const { login, register, siteConfig } = useRestaurant();

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

  const quickFillAndLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
    setIsLoggingIn(true);
    setTimeout(() => {
      login(email, pass);
      setIsLoggingIn(false);
    }, 150);
  };

  return (
    <div
      id="auth-gate-container"
      className="min-h-screen bg-[#FFF8ED] text-[#111827] flex flex-col justify-between selection:bg-[#C8102E] selection:text-white relative overflow-hidden"
    >
      {/* Top Header */}
      <header className="relative z-10 border-b border-[#E5E7EB] bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" showTagline={true} />
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#475569]">
            <ShieldCheck className="w-4 h-4 text-[#C8102E]" />
            <span>Member Authentication Required</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          {/* Left Column: Brand Story & Features */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] leading-[1.15] tracking-tight">
              Please sign in to access the restaurant
            </h1>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl">
              Welcome to <strong className="text-[#C8102E]">{siteConfig.restaurant_name}</strong>.
              To explore our chef-crafted menus, place orders, track kitchen preparations, and access administrative tools, please authenticate or register your account.
            </p>

           
            
          </div>

          {/* Right Column: Sign In / Create Account Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              id="auth-form-card"
              className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl shadow-xl p-6 sm:p-8"
            >
              {/* Tab Selector */}
              <div className="flex p-1 bg-[#FFF8ED] border border-[#E5E7EB] rounded-2xl mb-6">
                <button
                  id="gate-tab-login"
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                    activeTab === 'login'
                      ? 'bg-[#C8102E] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#111827]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  id="gate-tab-register"
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegError('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                    activeTab === 'register'
                      ? 'bg-[#C8102E] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#111827]'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Create Account
                </button>
              </div>

              {activeTab === 'login' ? (
                /* --- SIGN IN FORM --- */
                <form id="gate-login-form" onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div
                      id="gate-login-error"
                      className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#EF4444] text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5" htmlFor="gate-login-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        id="gate-login-email"
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
                    <label className="block text-xs font-medium text-[#475569] mb-1.5" htmlFor="gate-login-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        id="gate-login-password"
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

                  <button
                    id="gate-login-submit-btn"
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 px-4 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-sm rounded-xl transition shadow-md shadow-[#C8102E]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                  >
                    {isLoggingIn ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>Enter Restaurant</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* 1-Click Fast Role Sign-Ins */}
                  
                </form>
              ) : (
                /* --- CREATE ACCOUNT FORM --- */
                <form id="gate-register-form" onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {regError && (
                    <div
                      id="gate-register-error"
                      className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#EF4444] text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="gate-reg-name">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        id="gate-reg-name"
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
                    <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="gate-reg-email">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        id="gate-reg-email"
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
                      <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="gate-reg-phone">
                        Phone (WhatsApp)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                          id="gate-reg-phone"
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0803 123 4567"
                          className="w-full pl-9 pr-2 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="gate-reg-password">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                          id="gate-reg-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full pl-9 pr-2 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1" htmlFor="gate-reg-address">
                      Default Delivery Address (Optional)
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
                      <textarea
                        id="gate-reg-address"
                        rows={2}
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Street, apartment or landmark"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:border-[#C8102E] placeholder-[#9CA3AF] resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFF8ED] border border-[#E5E7EB] text-[11px] text-[#475569] flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>
                      Creating an account gives you full customer access to order dishes, track deliveries, and save order receipts.
                    </span>
                  </div>

                  <button
                    id="gate-register-submit-btn"
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-2.5 px-4 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-sm rounded-xl transition shadow-md shadow-[#C8102E]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                  >
                    {isRegistering ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Register & Enter Restaurant</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 border-t border-[#E5E7EB] bg-white py-4 text-center text-xs text-[#9CA3AF]">
        <p>© {new Date().getFullYear()} {siteConfig.restaurant_name}. All rights reserved.</p>
      </footer>
    </div>
  );
};
