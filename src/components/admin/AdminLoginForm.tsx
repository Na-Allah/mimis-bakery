import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface AdminLoginFormProps {
  mode?: 'page' | 'modal';
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  mode = 'page',
  onClose,
  onSuccess,
}) => {
  const { loginAdmin, siteConfig, navigateTo, currentUser, isAdmin, logout } = useRestaurant();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    // Artificial short delay for realistic security verification feel
    setTimeout(() => {
      const result = loginAdmin(email, password);
      setIsLoading(false);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigateTo({ type: 'admin' });
        }
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    }, 400);
  };

  const handleFillDemo = (demoEmail: string = 'asmuhammad42@gmail.com') => {
    setEmail(demoEmail);
    setPassword('admin123');
    setErrorMessage(null);
  };

  const content = (
    <div
      id="admin-login-card"
      className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-stone-100 max-w-md w-full relative"
    >
      {/* Close button for modal */}
      {mode === 'modal' && onClose && (
        <button
          id="btn-close-admin-login-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Header */}
      <div className="text-center space-y-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-bold mx-auto shadow-lg shadow-amber-950/50">
          <ShieldAlert className="w-8 h-8 text-stone-950" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            {siteConfig.restaurant_name}
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-white mt-1">
            Admin Access Required
          </h2>
          <p className="text-xs text-stone-400 mt-1.5 max-w-xs mx-auto">
            This page is strictly reserved for authorized management staff.
          </p>
        </div>
      </div>

      {/* Notice if currently signed in as non-admin user */}
      {currentUser && !isAdmin && (
        <div
          id="customer-role-restriction-alert"
          className="mb-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1.5"
        >
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Customer Account Active</span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            You are logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}) with the role <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 uppercase font-semibold text-[10px]">customer</span>. Customer accounts do not have administrator permissions.
          </p>
          <p className="text-amber-400/90 text-[11px]">
            Please sign in with administrator credentials below to access this view.
          </p>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div
          id="admin-login-error-banner"
          className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="input-admin-email"
            className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5"
          >
            Admin Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurant.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="input-admin-password"
            className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-admin-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-stone-950 border border-stone-800 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          id="btn-admin-login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-950/40 text-sm uppercase tracking-wider transition-all transform active:scale-98 disabled:opacity-75 mt-2"
        >
          {isLoading ? (
            <span>Verifying Credentials...</span>
          ) : (
            <>
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </>
          )}
        </button>
      </form>

      {/* Quick Fill Credentials Helper for Reviewer & Staff */}
      <div className="mt-8 pt-6 border-t border-stone-800 space-y-3">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 block text-center">
          Demo Testing Credentials
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-fill-default-admin"
            type="button"
            onClick={() => handleFillDemo('admin@restaurant.com')}
            className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/40 text-left transition-all group"
          >
            <span className="text-[10px] text-amber-400 font-bold block group-hover:text-amber-300">
              Default Admin
            </span>
            <span className="text-[11px] text-stone-300 font-mono block truncate">
              admin@restaurant.com
            </span>
          </button>

          <button
            id="btn-fill-user-admin"
            type="button"
            onClick={() => handleFillDemo('asmuhammad42@gmail.com')}
            className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/40 text-left transition-all group"
          >
            <span className="text-[10px] text-amber-400 font-bold block group-hover:text-amber-300">
              User Admin
            </span>
            <span className="text-[11px] text-stone-300 font-mono block truncate">
              asmuhammad42...
            </span>
          </button>
        </div>
        <p className="text-[10px] text-center text-stone-500">
          Password: <code className="text-amber-400 font-mono">admin123</code>
        </p>
      </div>

      {/* Back to store navigation (if page mode) */}
      {mode === 'page' && (
        <div className="mt-6 text-center">
          <button
            id="btn-admin-login-back-to-store"
            type="button"
            onClick={() => navigateTo({ type: 'home' })}
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Storefront</span>
          </button>
        </div>
      )}
    </div>
  );

  if (mode === 'modal') {
    return (
      <div
        id="admin-login-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>{content}</div>
      </div>
    );
  }

  return (
    <div
      id="admin-login-page-container"
      className="min-h-screen bg-stone-950 flex items-center justify-center py-12 px-4 sm:px-6"
    >
      {content}
    </div>
  );
};
