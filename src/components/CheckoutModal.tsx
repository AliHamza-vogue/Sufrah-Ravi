import React, { useEffect, useState } from 'react';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CartItem, Order } from '../types';
import {
  X,
  CheckCircle2,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  History,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUserId: string;
  currentUser?: { name: string; email: string } | null;
  onOrderPlaced: (order: Order) => void;
  onClearCart: () => void;
  onViewOrderHistory: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUserId,
  currentUser,
  onOrderPlaced,
  onClearCart,
  onViewOrderHistory,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (currentUser?.name) {
      setCustomerName((prev) => prev || currentUser.name);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 30 ? 0 : 7;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = customerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setErrorMsg('Please enter your full name (2 to 60 characters).');
      return;
    }
    if (trimmedPhone.length < 5 || trimmedPhone.length > 30) {
      setErrorMsg('Please enter a valid phone number (5 to 30 characters).');
      return;
    }
    if (trimmedAddress.length < 3 || trimmedAddress.length > 300) {
      setErrorMsg('Please enter your delivery address (3 to 300 characters).');
      return;
    }
    if (cartItems.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = 'SR-' + Math.floor(1000 + Math.random() * 9000);
      const orderRef = doc(collection(db, 'orders'));
      const orderId = orderRef.id;
      const orderPrivateRef = doc(db, 'order_private', orderId);

      // Encode up to 20 line items within strict string length bounds
      const itemCodes = cartItems.slice(0, 20).map((item) => {
        const cleanNote = (item.specialInstructions || '')
          .replace(/\|/g, ' ')
          .trim()
          .slice(0, 50);
        return `${item.menuItem.id}|${Math.max(1, Math.round(item.quantity))}|${
          item.selectedSpice ?? 1
        }|${cleanNote}`;
      });

      const batch = writeBatch(db);

      batch.set(orderRef, {
        orderNumber,
        userId: (currentUserId || 'guest_user').slice(0, 128),
        customerName: trimmedName,
        itemCodes,
        subtotal: Math.round(subtotal),
        deliveryFee: Math.round(deliveryFee),
        total: Math.round(total),
        paymentMethod,
        status: 'Received',
        isPublicOrder: true,
        createdAt: serverTimestamp(),
      });

      batch.set(orderPrivateRef, {
        orderId,
        phone: trimmedPhone,
        address: trimmedAddress,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      const newOrder: Order = {
        id: orderNumber,
        orderNumber,
        userId: currentUserId,
        customerName: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        items: [...cartItems],
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        status: 'Received',
        createdAt: 'Just now',
      };

      onOrderPlaced(newOrder);
      setConfirmedOrder(newOrder);
      onClearCart();
    } catch (error) {
      setErrorMsg('Could not place your order. Please verify your details and try again.');
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-5 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {confirmedOrder ? (
          <div className="text-center space-y-6 py-4 sm:py-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {t('Order Placed Successfully!')}
              </span>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {t('Thank You')}, {confirmedOrder.customerName}!
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                <span className="font-bold text-stone-900 dark:text-stone-100">#{confirmedOrder.id}</span>
              </p>
            </div>

            {/* Order Tracking Status */}
            <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-start space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                <span>{t('Order Status')}</span>
                <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                  {t(confirmedOrder.status)}
                </span>
              </div>
              {confirmedOrder.address && (
                <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{t('Delivery Address')}: {confirmedOrder.address}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200 dark:border-stone-800">
                <span>
                  {t('Total Amount')} ({confirmedOrder.paymentMethod === 'cod' ? t('Cash on Delivery') : t('Online Card')})
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {confirmedOrder.total} {t('SAR')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {currentUser && (
                <button
                  onClick={() => {
                    setConfirmedOrder(null);
                    onClose();
                    onViewOrderHistory();
                  }}
                  className="flex-1 py-3 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4 text-amber-600" />
                  <span>{t('View Order History')}</span>
                </button>
              )}
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-md transition-colors text-sm"
              >
                {t('Return to Menu')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {t('Secure Checkout · إتمام الطلب')}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {t('Complete Your Order')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl"
                aria-label="Close checkout"
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

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={60}
                  placeholder="e.g. Faisal Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  minLength={5}
                  maxLength={30}
                  placeholder="e.g. +966 5X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  minLength={3}
                  maxLength={300}
                  rows={2}
                  placeholder="Street, District, Building No..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <Banknote className="w-4 h-4 shrink-0" />
                    <span>Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Online Card / Apple Pay</span>
                  </button>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{subtotal} SAR</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{deliveryFee} SAR</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <span>Total Amount</span>
                  <span className="text-amber-700 dark:text-amber-400">{total} SAR</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-md transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Place Order ({total} SAR)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
