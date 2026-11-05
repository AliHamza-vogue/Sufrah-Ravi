import React, { useState } from 'react';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  X,
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface AuthenticatedUser {
  name: string;
  email: string;
  accountId: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthenticatedUser | null;
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onLogout: () => void;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { t } = useLanguage();

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (
      normalizedEmail.length < 5 ||
      normalizedEmail.length > 120 ||
      !EMAIL_REGEX.test(normalizedEmail)
    ) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp && (trimmedName.length < 2 || trimmedName.length > 60)) {
      setErrorMsg('Please enter your full name (2 to 60 characters).');
      return;
    }

    setLoading(true);
    try {
      const emailHash = await sha256Hex(`sufrah_ravi_acct:${normalizedEmail}`);
      const accountId = `u_${emailHash}`;
      const passwordHash = await sha256Hex(
        `sufrah_ravi_pw:${normalizedEmail}:${password}`
      );

      const accountRef = doc(db, 'user_accounts', accountId);
      const existingSnap = await getDoc(accountRef);

      if (isSignUp) {
        if (existingSnap.exists()) {
          setErrorMsg(
            'An account with this email already exists in our database. Please Sign In instead.'
          );
          setLoading(false);
          return;
        }

        const privateRef = doc(db, 'user_private', accountId);
        const batch = writeBatch(db);

        batch.set(accountRef, {
          accountId,
          name: trimmedName,
          passwordHash,
          createdAt: serverTimestamp(),
        });

        batch.set(privateRef, {
          accountId,
          email: normalizedEmail,
          createdAt: serverTimestamp(),
        });

        await batch.commit();

        const loggedUser: AuthenticatedUser = {
          name: trimmedName,
          email: normalizedEmail,
          accountId,
        };
        onLoginSuccess(loggedUser);
        setSuccessMsg('Account created and saved in database!');
        setTimeout(() => {
          setSuccessMsg('');
          resetForm();
          onClose();
        }, 1000);
      } else {
        // Sign In flow: verify user exists in DB and password matches
        if (!existingSnap.exists()) {
          setErrorMsg(
            'No account found with this email address. Please Sign Up first to create an account.'
          );
          setLoading(false);
          return;
        }

        const accountData = existingSnap.data();
        if (accountData.passwordHash !== passwordHash) {
          setErrorMsg('Incorrect password. Please check your password and try again.');
          setLoading(false);
          return;
        }

        const loggedUser: AuthenticatedUser = {
          name: String(accountData.name || normalizedEmail.split('@')[0]),
          email: normalizedEmail,
          accountId,
        };
        onLoginSuccess(loggedUser);
        setSuccessMsg(`Welcome back, ${loggedUser.name}!`);
        setTimeout(() => {
          setSuccessMsg('');
          resetForm();
          onClose();
        }, 1000);
      }
    } catch (error) {
      setErrorMsg('Authentication error. Please try again.');
      handleFirestoreError(
        error,
        isSignUp ? OperationType.WRITE : OperationType.GET,
        'user_accounts'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {successMsg ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {t(successMsg)}
            </h3>
          </div>
        ) : currentUser ? (
          /* Logged-in Profile & Logout View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {t('Your Account · حسابك')}
                </span>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {t('Account Profile')}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-2 border-t border-stone-200 dark:border-stone-800">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t('Verified Sufrah Ravi Database Account')}</span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                {t('Customer Support')}:{' '}
                <a
                  href="mailto:support@sufrahravi.com"
                  dir="ltr"
                  data-no-translate="true"
                  className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  support@sufrahravi.com
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-semibold rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm"
              >
                {t('Close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('Log Out')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {t('Sufrah Ravi Account · حساب العملاء')}
                </span>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {isSignUp ? t('Create Account') : t('Sign In')}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={60}
                      placeholder="e.g. Faisal Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    minLength={5}
                    maxLength={120}
                    placeholder="e.g. faisal@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-md transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isSignUp ? 'Creating Account...' : 'Verifying Password...'}</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                }}
                className="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </button>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-900">
                {t('Need help with your account?')}{' '}
                <a
                  href="mailto:support@sufrahravi.com"
                  dir="ltr"
                  data-no-translate="true"
                  className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  support@sufrahravi.com
                </a>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
