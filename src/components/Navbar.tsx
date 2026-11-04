import React from 'react';
import {
  ShoppingCart,
  User as UserIcon,
  Menu as MenuIcon,
  X,
  History,
  LogOut,
  Languages,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getAssetUrl } from '../data/embeddedAssets';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentUser: { name: string; email: string } | null;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAuth,
  onLogout,
  currentUser,
  activeSection,
  setActiveSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { language, toggleLanguage, t, isTranslating } = useLanguage();

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/55 dark:bg-stone-950/55 backdrop-blur-md border-b border-stone-200/40 dark:border-stone-800/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Zone 1: Brand title with seamless circular Logo */}
        <button
          onClick={() => setActiveSection('home')}
          className="flex items-center gap-2.5 sm:gap-3 text-left rtl:text-right group whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5F2EB] border border-amber-600/40 overflow-hidden flex items-center justify-center shadow-sm shrink-0">
            <img
              src={getAssetUrl('WhatsApp_Image_2026-11-04_at_11.48.52_AM_0c9b2a14.jpeg')}
              alt="Sufrah Ravi Logo"
              className="w-full h-full object-cover rounded-full mix-blend-multiply scale-[2.1] translate-y-2.5 -translate-x-0.5"
            />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors block">
              {t('Sufrah Ravi')}
            </span>
            {language === 'en' && (
              <span
                data-no-translate="true"
                className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-400 font-medium tracking-wide block -mt-1"
              >
                سفرة راوي
              </span>
            )}
          </div>
        </button>

        {/* Zone 2: Nav links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => setActiveSection('home')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'home' ? 'text-amber-700 dark:text-amber-400 font-semibold' : ''
            }`}
          >
            {t('Home')}
          </button>
          <button
            onClick={() => setActiveSection('menu')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'menu' ? 'text-amber-700 dark:text-amber-400 font-semibold' : ''
            }`}
          >
            {t('Menu & Order')}
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveSection('orders')}
              className={`flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'orders' ? 'text-amber-700 dark:text-amber-400 font-semibold' : ''
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('Order History')}</span>
            </button>
          )}
          <button
            onClick={() => setActiveSection('story')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'story' ? 'text-amber-700 dark:text-amber-400 font-semibold' : ''
            }`}
          >
            {t('Our Story & Pakistani Heritage')}
          </button>
          <button
            onClick={() => setActiveSection('reviews')}
            className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'reviews' ? 'text-amber-700 dark:text-amber-400 font-semibold' : ''
            }`}
          >
            {t('Reviews')}
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Cart Icon -> Profile Icon -> Language Icon -> Mobile toggle) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1. Shopping Cart Icon Only */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2.5 text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors shrink-0"
            aria-label={t('Cart')}
            title={t('Cart')}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-amber-300 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-stone-950">
                {cartCount}
              </span>
            )}
          </button>

          {/* 2. Profile Icon Only (after Cart icon) */}
          <button
            onClick={onOpenAuth}
            title={currentUser ? currentUser.name : t('Sign Up / Sign In')}
            aria-label={currentUser ? currentUser.name : t('Sign Up / Sign In')}
            className="relative flex items-center justify-center p-2.5 text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors shrink-0"
          >
            <UserIcon className="w-4 h-4 text-amber-600 shrink-0" />
            {currentUser && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-stone-950" />
            )}
          </button>

          {currentUser && (
            <button
              onClick={onLogout}
              title={t('Logout')}
              aria-label={t('Logout')}
              className="hidden sm:flex items-center justify-center p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          )}

          {/* 3. Language Icon Only (after Profile icon) */}
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            className="flex items-center justify-center p-2.5 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-300/60 dark:border-amber-700/50 rounded-lg transition-colors shrink-0"
          >
            {isTranslating ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            ) : (
              <Languages className="w-4 h-4 text-amber-600 shrink-0" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 sm:px-6 py-4 space-y-2 shadow-lg">
          <button
            onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }}
            className={`block w-full text-start px-3 py-2.5 rounded-xl font-medium text-sm ${
              activeSection === 'home'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold'
                : 'text-stone-800 dark:text-stone-200'
            }`}
          >
            {t('Home')}
          </button>
          <button
            onClick={() => { setActiveSection('menu'); setMobileMenuOpen(false); }}
            className={`block w-full text-start px-3 py-2.5 rounded-xl font-medium text-sm ${
              activeSection === 'menu'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold'
                : 'text-stone-800 dark:text-stone-200'
            }`}
          >
            {t('Menu & Order')}
          </button>
          {currentUser && (
            <button
              onClick={() => { setActiveSection('orders'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 w-full text-start px-3 py-2.5 rounded-xl font-medium text-sm ${
                activeSection === 'orders'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'text-stone-800 dark:text-stone-200'
              }`}
            >
              <History className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('Order History')}</span>
            </button>
          )}
          <button
            onClick={() => { setActiveSection('story'); setMobileMenuOpen(false); }}
            className={`block w-full text-start px-3 py-2.5 rounded-xl font-medium text-sm ${
              activeSection === 'story'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold'
                : 'text-stone-800 dark:text-stone-200'
            }`}
          >
            {t('Our Story & Pakistani Heritage')}
          </button>
          <button
            onClick={() => { setActiveSection('reviews'); setMobileMenuOpen(false); }}
            className={`block w-full text-start px-3 py-2.5 rounded-xl font-medium text-sm ${
              activeSection === 'reviews'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold'
                : 'text-stone-800 dark:text-stone-200'
            }`}
          >
            {t('Reviews')}
          </button>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-900 space-y-2">
            <button
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 w-full text-start px-3 py-2.5 rounded-xl text-amber-700 dark:text-amber-400 font-semibold text-sm bg-stone-50 dark:bg-stone-900"
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {currentUser
                  ? `${currentUser.name} (${currentUser.email})`
                  : t('Sign Up / Sign In')}
              </span>
            </button>
            {currentUser && (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full text-start px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 font-semibold text-sm bg-red-50 dark:bg-red-950/40"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>{t('Log Out')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
