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
  Utensils,
  Clock,
  MessageCircle,
  ShoppingBag,
  Award,
} from 'lucide-react';

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
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950 relative overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Header */}
      <header className="relative z-10 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-950/40">
              <Utensils className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <span className="font-serif-display text-lg font-bold text-white tracking-wide block leading-tight">
                {siteConfig.restaurant_name}
              </span>
              <span className="text-xs text-stone-400">Exclusive Dining & Delivery Portal</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Member Authentication Required</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          {/* Left Column: Brand Story & Features */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authentic Culinary Excellence</span>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-50 leading-[1.15]">
              Please sign in to access the restaurant
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
              Welcome to <strong className="text-amber-400">{siteConfig.restaurant_name}</strong>.
              To explore our chef-crafted menus, place orders, track kitchen preparations, and access administrative tools, please authenticate or register your account.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-200">Curated Menu</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Browse seasonal dishes & order seamlessly</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-200">Live Kitchen Tracking</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Real-time prep & dispatch notifications</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-200">WhatsApp Dispatch</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Direct kitchen coordination via WhatsApp</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-200">Role-Based Access</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Customer & Admin privileges supported</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In / Create Account Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              id="auth-form-card"
              className="w-full max-w-md bg-stone-900/95 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md"
            >
              {/* Tab Selector */}
              <div className="flex p-1 bg-stone-950/70 border border-stone-800 rounded-2xl mb-6">
                <button
                  id="gate-tab-login"
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
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
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
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
                      className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5" htmlFor="gate-login-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input
                        id="gate-login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. asmuhammad42@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-stone-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5" htmlFor="gate-login-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input
                        id="gate-login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-stone-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
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
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
                  <div className="pt-3 border-t border-stone-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Sign-In (1-Click)
                      </span>
                      <span className="text-[10px] text-stone-500">Auto-fills & logs in</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Admin Quick Login */}
                      <button
                        type="button"
                        id="gate-demo-admin-btn"
                        onClick={() => quickFillAndLogin('asmuhammad42@gmail.com', 'admin123')}
                        className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">Muhammad</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                            Admin
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">asmuhammad42@gmail.com</div>
                        <div className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3 h-3" /> Unlocks Admin Portal
                        </div>
                      </button>

                      {/* Customer Quick Login */}
                      <button
                        type="button"
                        id="gate-demo-customer-btn"
                        onClick={() => quickFillAndLogin('adeola@example.com', 'customer123')}
                        className="p-2.5 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/80 text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-200">Adeola</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-700 text-stone-300 font-semibold uppercase">
                            Customer
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">adeola@example.com</div>
                        <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                          <UserIcon className="w-3 h-3" /> Standard Diner Access
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* --- CREATE ACCOUNT FORM --- */
                <form id="gate-register-form" onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {regError && (
                    <div
                      id="gate-register-error"
                      className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="gate-reg-name">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input
                        id="gate-reg-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Adeola Davies"
                        className="w-full pl-9 pr-3 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder-stone-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="gate-reg-email">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input
                        id="gate-reg-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder-stone-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="gate-reg-phone">
                        Phone (WhatsApp)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input
                          id="gate-reg-phone"
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0803 123 4567"
                          className="w-full pl-9 pr-2 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder-stone-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="gate-reg-password">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input
                          id="gate-reg-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full pl-9 pr-2 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder-stone-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1" htmlFor="gate-reg-address">
                      Default Delivery Address (Optional)
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                      <textarea
                        id="gate-reg-address"
                        rows={2}
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Street, apartment or landmark"
                        className="w-full pl-9 pr-3 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder-stone-600 resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-800/40 border border-stone-800 text-[11px] text-stone-400 flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Creating an account gives you full customer access to order dishes, track deliveries, and save order receipts.
                    </span>
                  </div>

                  <button
                    id="gate-register-submit-btn"
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
      <footer className="relative z-10 border-t border-stone-900 bg-stone-950 py-4 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} {siteConfig.restaurant_name}. All rights reserved.</p>
      </footer>
    </div>
  );
};
