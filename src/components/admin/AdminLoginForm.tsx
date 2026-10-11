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
  AlertCircle,
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
  const { loginAdmin, siteConfig, navigateTo, currentUser, isAdmin } = useRestaurant();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await loginAdmin(email, password);
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigateTo({ type: 'admin' });
        }
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div
      id="admin-login-card"
      className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-10 shadow-lg text-[#111827] max-w-md w-full relative"
    >
      {/* Close button for modal */}
      {mode === 'modal' && onClose && (
        <button
          id="btn-close-admin-login-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#475569] hover:text-[#111827] hover:bg-[#FFF8ED] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Header */}
      <div className="text-center space-y-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] flex items-center justify-center text-[#C8102E] font-bold mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C8102E]">
            {siteConfig.restaurant_name}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
            Admin Access Required
          </h2>
          <p className="text-xs text-[#475569] mt-1.5 max-w-xs mx-auto">
            This page is strictly reserved for authorized management staff.
          </p>
        </div>
      </div>

      {/* Notice if currently signed in as non-admin user */}
      {currentUser && !isAdmin && (
        <div
          id="customer-role-restriction-alert"
          className="mb-5 p-3.5 rounded-2xl bg-[#FFF8ED] border border-[#E5E7EB] text-xs text-[#111827] space-y-1.5"
        >
          <div className="flex items-center gap-2 font-bold text-[#C8102E]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Customer Account Active</span>
          </div>
          <p className="text-[#475569] leading-relaxed">
            You are logged in as <strong className="text-[#111827]">{currentUser.full_name}</strong> ({currentUser.email}) with the role <span className="px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] text-[#475569] uppercase font-semibold text-[10px]">customer</span>. Customer accounts do not have administrator permissions.
          </p>
          <p className="text-[#C8102E] text-[11px] font-medium">
            Please sign in with administrator credentials below to access this view.
          </p>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div
          id="admin-login-error-banner"
          className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-[#EF4444] text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="input-admin-email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1.5"
          >
            Admin Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurant.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] transition-all min-h-[44px]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="input-admin-password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-admin-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] transition-all min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] transition-colors cursor-pointer"
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
          className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-[#C8102E]/20 text-sm uppercase tracking-wider transition-all transform active:scale-98 disabled:opacity-75 mt-2 min-h-[44px] cursor-pointer"
        >
          {isLoading ? (
            <span>Verifying Credentials...</span>
          ) : (
            <>
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Back to store navigation (if page mode) */}
      {mode === 'page' && (
        <div className="mt-6 text-center">
          <button
            id="btn-admin-login-back-to-store"
            type="button"
            onClick={() => navigateTo({ type: 'home' })}
            className="inline-flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#111827] transition-colors cursor-pointer min-h-[44px]"
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>{content}</div>
      </div>
    );
  }

  return (
    <div
      id="admin-login-page-container"
      className="min-h-screen bg-[#FFF8ED]/40 flex items-center justify-center py-12 px-4 sm:px-6"
    >
      {content}
    </div>
  );
};
