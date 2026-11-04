import React from 'react';
import { CartItem } from '../types';
import { X, ShoppingCart, Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

function getCartCustomizationText(item: CartItem): string | null {
  const { menuItem, selectedSpice } = item;
  if (menuItem.id === 'nashta-3' || menuItem.id === 'chai-3') return null;
  if (menuItem.id === 'chai-1' || menuItem.id === 'chai-2') {
    const sugarMap: Record<number, string> = {
      0: 'No Sugar',
      1: 'Less Sugar',
      2: 'Regular Sugar',
      3: 'Extra Sweet',
    };
    return `Sugar: ${sugarMap[selectedSpice ?? 2] || 'Regular Sugar'}`;
  }
  const spiceMap: Record<number, string> = {
    0: 'Mild',
    1: 'Medium',
    2: 'Spicy',
    3: 'Extra',
  };
  return `Spice: ${spiceMap[selectedSpice ?? 1] || 'Medium'}`;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const { t, isArabic } = useLanguage();

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 30 ? 0 : 7;
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className={`absolute inset-y-0 ${isArabic ? 'left-0 pr-0 sm:pr-10' : 'right-0 pl-0 sm:pl-10'} max-w-full flex`}>
        <div className="w-screen max-w-md bg-white dark:bg-stone-950 border-x border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-700 dark:text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {t('Your Order Cart')} ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingCart className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto" />
                <p className="text-stone-500 font-medium text-sm">{t('Your cart is empty.')}</p>
                <p className="text-xs text-stone-400">
                  {t('Add delicious items from our menu to start your order.')}
                </p>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const customLabel = getCartCustomizationText(item);
                return (
                  <div
                    key={index}
                    className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {t(item.menuItem.nameEn)}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          {!isArabic && (
                            <span
                              data-no-translate="true"
                              className="text-xs text-amber-700 dark:text-amber-400"
                            >
                              {item.menuItem.nameUr}
                            </span>
                          )}
                          {customLabel && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                              {t(customLabel)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums shrink-0">
                        {item.menuItem.price * item.quantity} {t('SAR')}
                      </span>
                    </div>

                    {item.specialInstructions && (
                      <p className="text-xs text-stone-500 italic bg-stone-100 dark:bg-stone-950 p-2 rounded-lg">
                        {t(item.specialInstructions)}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onUpdateQuantity(index, -1)}
                          className="w-8 h-8 bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center font-bold text-xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, 1)}
                          className="w-8 h-8 bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center font-bold text-xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Totals */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>{t('Subtotal')}</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                    {subtotal} {t('SAR')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>
                    {t('Delivery Fee')} {subtotal >= 30 ? t('(Free over 30 SAR)') : ''}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                    {deliveryFee} {t('SAR')}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <span>{t('Total Amount')}</span>
                  <span className="text-amber-700 dark:text-amber-400 tabular-nums">
                    {total} {t('SAR')}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <span>{t('Proceed to Checkout')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
