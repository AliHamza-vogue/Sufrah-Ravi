import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CartItem, Order } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { OrderHistory } from './components/OrderHistory';
import { StorySection } from './components/StorySection';
import { Testimonials } from './components/Testimonials';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal, AuthenticatedUser } from './components/AuthModal';
import { Footer } from './components/Footer';
import { LanguageProvider } from './contexts/LanguageContext';

const SESSION_STORAGE_KEY = 'sufrah_ravi_auth_session';

function getOrCreateClientUserId(): string {
  try {
    const key = 'sufrah_ravi_user_id';
    const existing = localStorage.getItem(key);
    if (existing && existing.length >= 4) return existing;
    const generated =
      'sr_guest_' +
      Math.random().toString(36).substring(2, 10) +
      '_' +
      Date.now().toString(36);
    localStorage.setItem(key, generated);
    return generated;
  } catch {
    return 'sr_guest_default';
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [clientUserId, setClientUserId] = useState<string>('sr_guest_default');

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  useEffect(() => {
    setClientUserId(getOrCreateClientUserId());

    // Restore session only if the user record genuinely exists in Firestore DB
    async function restoreVerifiedSession() {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as AuthenticatedUser;
        if (!parsed?.accountId || !parsed?.email) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          return;
        }
        const snap = await getDoc(doc(db, 'user_accounts', parsed.accountId));
        if (snap.exists()) {
          const data = snap.data();
          setCurrentUser({
            name: String(data.name || parsed.name),
            email: parsed.email,
            accountId: parsed.accountId,
          });
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    restoreVerifiedSession();
  }, []);

  const handleLoginSuccess = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage quota errors
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (activeSection === 'orders') {
      setActiveSection('home');
    }
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const effectiveUserId = currentUser?.accountId || clientUserId;

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.menuItem.id === item.menuItem.id &&
          i.selectedSpice === item.selectedSpice &&
          i.specialInstructions === item.specialInstructions
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleReorderItems = (itemsToReorder: CartItem[]) => {
    setCartItems((prev) => {
      const updated = [...prev];
      for (const item of itemsToReorder) {
        const existingIndex = updated.findIndex(
          (i) =>
            i.menuItem.id === item.menuItem.id &&
            i.selectedSpice === item.selectedSpice &&
            i.specialInstructions === item.specialInstructions
        );
        if (existingIndex > -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + item.quantity,
          };
        } else {
          updated.push({ ...item });
        }
      }
      return updated;
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <LanguageProvider>
      <div className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors">
        
        {/* Navbar */}
        <Navbar
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        {/* Main Content Sections */}
        <main className="flex-1 pt-16 sm:pt-[72px]">
          {activeSection === 'home' && (
            <>
              <Hero
                onStartOrder={() => setActiveSection('menu')}
                onExploreStory={() => setActiveSection('story')}
              />
              <MenuSection onAddToCart={handleAddToCart} />
              {currentUser && (
                <OrderHistory
                  currentUserId={currentUser.accountId}
                  currentUser={currentUser}
                  onReorderItems={handleReorderItems}
                  onAddSingleItem={handleAddToCart}
                  onBrowseMenu={() => setActiveSection('menu')}
                />
              )}
              <StorySection />
              <Testimonials currentUser={currentUser} />
            </>
          )}

          {activeSection === 'menu' && (
            <MenuSection onAddToCart={handleAddToCart} />
          )}

          {activeSection === 'orders' && currentUser && (
            <OrderHistory
              currentUserId={currentUser.accountId}
              currentUser={currentUser}
              onReorderItems={handleReorderItems}
              onAddSingleItem={handleAddToCart}
              onBrowseMenu={() => setActiveSection('menu')}
            />
          )}

          {activeSection === 'story' && (
            <StorySection />
          )}

          {activeSection === 'reviews' && (
            <Testimonials currentUser={currentUser} />
          )}
        </main>

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          currentUserId={effectiveUserId}
          currentUser={currentUser}
          onOrderPlaced={handleOrderPlaced}
          onClearCart={() => setCartItems([])}
          onViewOrderHistory={() => setActiveSection('orders')}
        />

        {/* Auth Modal (Sign Up / Sign In / Account Profile) */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />

        {/* Footer */}
        <Footer />

      </div>
    </LanguageProvider>
  );
}
