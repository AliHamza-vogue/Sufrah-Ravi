import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CartItem, Order } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import {
  History,
  RotateCcw,
  Check,
  Clock,
  ShoppingBag,
  Search,
  Plus,
  Loader2,
  Utensils,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OrderHistoryProps {
  currentUserId: string;
  currentUser?: { name: string; email: string } | null;
  onReorderItems: (items: CartItem[]) => void;
  onAddSingleItem: (item: CartItem) => void;
  onBrowseMenu: () => void;
}

function formatOrderTimestamp(ts?: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Just now';
  const date = ts.toDate();
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function decodeItemCodes(itemCodes: unknown): CartItem[] {
  if (!Array.isArray(itemCodes)) return [];
  const decoded: CartItem[] = [];

  for (const raw of itemCodes) {
    if (typeof raw !== 'string') continue;
    const parts = raw.split('|');
    const menuItemId = parts[0];
    const quantity = Math.max(1, parseInt(parts[1] || '1', 10) || 1);
    const selectedSpice = parseInt(parts[2] || '1', 10);
    const specialInstructions = parts.slice(3).join('|').trim();

    const foundMenu = MENU_ITEMS.find((m) => m.id === menuItemId);
    if (foundMenu) {
      decoded.push({
        menuItem: foundMenu,
        quantity,
        selectedSpice: isNaN(selectedSpice) ? 1 : selectedSpice,
        specialInstructions,
      });
    }
  }
  return decoded;
}

function getCustomizationLabel(item: CartItem): string | null {
  const { menuItem, selectedSpice } = item;
  if (menuItem.id === 'nashta-3' || menuItem.id === 'chai-3') return null;
  if (menuItem.id === 'chai-1' || menuItem.id === 'chai-2') {
    const sugarMap: Record<number, string> = {
      0: 'No Sugar',
      1: 'Less Sugar',
      2: 'Regular Sugar',
      3: 'Extra Sweet',
    };
    return sugarMap[selectedSpice ?? 2] || 'Regular Sugar';
  }
  const spiceMap: Record<number, string> = {
    0: 'Mild',
    1: 'Medium',
    2: 'Spicy',
    3: 'Extra Spicy',
  };
  return `Spice: ${spiceMap[selectedSpice ?? 1] || 'Medium'}`;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  currentUserId,
  currentUser,
  onReorderItems,
  onAddSingleItem,
  onBrowseMenu,
}) => {
  const { t, isArabic } = useLanguage();
  const [orders, setOrders] = useState<Array<Order & { createdAtMs: number }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reorderedOrderId, setReorderedOrderId] = useState<string | null>(null);
  const [addedItemKey, setAddedItemKey] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || !currentUserId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ordersQuery = query(
      collection(db, 'orders'),
      where('isPublicOrder', '==', true),
      where('userId', '==', currentUserId)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const fetched: Array<Order & { createdAtMs: number }> = snapshot.docs.map(
          (docSnap) => {
            const data = docSnap.data();
            const createdAtTs = data.createdAt as Timestamp | undefined;
            const createdAtMs =
              createdAtTs && typeof createdAtTs.toMillis === 'function'
                ? createdAtTs.toMillis()
                : Date.now();

            const items = decodeItemCodes(data.itemCodes);
            const orderNumber = String(data.orderNumber || docSnap.id.slice(0, 8));

            return {
              id: docSnap.id,
              orderNumber,
              userId: String(data.userId || ''),
              customerName: String(data.customerName || 'Guest'),
              items,
              subtotal: Number(data.subtotal || 0),
              deliveryFee: Number(data.deliveryFee || 0),
              total: Number(data.total || 0),
              paymentMethod: data.paymentMethod === 'card' ? 'card' : 'cod',
              status:
                data.status === 'Preparing' ||
                data.status === 'Ready' ||
                data.status === 'Delivered'
                  ? data.status
                  : 'Received',
              createdAt: formatOrderTimestamp(createdAtTs),
              createdAtMs,
            };
          }
        );

        fetched.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setOrders(fetched);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    return () => unsubscribe();
  }, [currentUser, currentUserId]);

  // Never render Order History for guests / logged-out visitors
  if (!currentUser) {
    return null;
  }

  const displayedOrders = orders.filter((order) => {
    if (order.userId !== currentUserId) {
      return false;
    }

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const matchesOrderNum = (order.orderNumber || order.id).toLowerCase().includes(q);
    const matchesDish = order.items.some((i) =>
      i.menuItem.nameEn.toLowerCase().includes(q)
    );
    return matchesOrderNum || matchesDish;
  });

  const handleReorderAll = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    onReorderItems(order.items);
    setReorderedOrderId(order.id);
    setTimeout(() => setReorderedOrderId(null), 1800);
  };

  const handleSingleItemReorder = (orderId: string, idx: number, item: CartItem) => {
    onAddSingleItem({ ...item });
    const key = `${orderId}-${idx}`;
    setAddedItemKey(key);
    setTimeout(() => setAddedItemKey(null), 1200);
  };

  return (
    <section id="order-history" className="py-12 sm:py-16 bg-stone-50 dark:bg-stone-900 min-h-[70vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className={`space-y-2 text-center ${isArabic ? 'md:text-right' : 'md:text-left'}`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold">
              <History className="w-3.5 h-3.5" />
              <span>{t('Order History · سجل الطلبات')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {t('Your Past Orders & Quick Reorder')}
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base max-w-2xl">
              {t('View your previous Sufrah Ravi meals stored in our live database and reorder your favorite dishes in a single tap.')}
            </p>
          </div>

          {/* Search Control */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className={`absolute ${isArabic ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400`} />
              <input
                type="text"
                placeholder={t('Search Order # or dish...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600`}
              />
            </div>
          </div>
        </div>

        {/* Orders List / Loading / Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
            <p className="text-sm font-medium">{t('Loading your order history...')}</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="bg-white dark:bg-stone-950 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              {t('No Past Orders Found')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {searchTerm
                ? t('No orders matched your search query. Try clearing the search box.')
                : t('You haven’t placed an order yet. Explore our freshly prepared Nashta, Qorma, and Karak Chai to place your first order!')}
            </p>
            <div className="pt-2">
              <button
                onClick={onBrowseMenu}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                <Utensils className="w-4 h-4" />
                <span>{t('Browse Menu & Order')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedOrders.map((order) => {
              const isReordered = reorderedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-stone-950 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  {/* Top Bar: Order Number, Date, Status */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                          {isArabic ? `طلب رقم #${order.orderNumber || order.id.slice(0, 8)}` : `Order #${order.orderNumber || order.id.slice(0, 8)}`}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                          {t(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{t(order.createdAt)}</span>
                        <span>·</span>
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          {t(order.customerName)}
                        </span>
                      </div>
                    </div>

                    <div className={isArabic ? 'text-left' : 'text-right'}>
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-400 tabular-nums block">
                        {order.total} {t('SAR')}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                        {order.paymentMethod === 'card' ? (
                          <>
                            <CreditCard className="w-3 h-3" />
                            <span>{t('Card / Apple Pay')}</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3 h-3" />
                            <span>{t('Cash on Delivery')}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Ordered Items List */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                      {t('Ordered Items')} ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                    </span>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => {
                        const customLabel = getCustomizationLabel(item);
                        const itemKey = `${order.id}-${idx}`;
                        const isItemAdded = addedItemKey === itemKey;

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.menuItem.image}
                                alt={item.menuItem.nameEn}
                                className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                                  {item.quantity}x {isArabic ? t(item.menuItem.nameEn) : item.menuItem.nameEn}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                                  <span className="font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                                    {item.menuItem.price * item.quantity} {t('SAR')}
                                  </span>
                                  {customLabel && (
                                    <>
                                      <span>·</span>
                                      <span>{t(customLabel)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSingleItemReorder(order.id, idx, item)}
                              className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isItemAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-600 hover:text-amber-700 dark:hover:text-amber-400'
                              }`}
                              title={t(item.menuItem.nameEn)}
                            >
                              {isItemAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{t('Added')}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{t('Add')}</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Action: Reorder All */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-stone-500">
                      {t('Subtotal')}: {order.subtotal} {t('SAR')} · {t('Delivery')}:{' '}
                      {order.deliveryFee === 0 ? t('Free') : `${order.deliveryFee} ${t('SAR')}`}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReorderAll(order)}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                        isReordered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-700 hover:bg-amber-800 text-white'
                      }`}
                    >
                      {isReordered ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t('Added All Items to Cart!')}</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>{t('Reorder Entire Meal')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
