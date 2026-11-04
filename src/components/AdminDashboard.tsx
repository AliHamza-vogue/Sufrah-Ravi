import React from 'react';
import { Order } from '../types';
import { X, ChefHat, Clock, CheckCircle2, DollarSign, Phone, MapPin } from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
}) => {
  if (!isOpen) return null;

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Kitchen & Manager Dashboard
              </h2>
              <p className="text-xs text-stone-500">
                Live order management portal for Sufrah Ravi (سفرة راوي)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Total Orders</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {orders.length}
            </p>
          </div>

          <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {totalRevenue} SAR
            </p>
          </div>

          <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Active Kitchen Status</span>
            </div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              🟢 Kitchen Open & Active
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            Incoming & Active Orders
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 text-sm">
              No orders placed yet in this session. Place an order from the menu to test live kitchen tracking!
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                          Order #{order.id}
                        </span>
                        <span className="text-xs text-stone-500">at {order.createdAt}</span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-0.5">
                        Customer: <span className="text-stone-900 dark:text-stone-100 font-bold">{order.customerName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400 tabular-nums bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-xl">
                        {order.total} SAR
                      </span>

                      {/* Status Selector */}
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="px-3 py-1.5 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      >
                        <option value="Received">Received</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Contact & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 dark:text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{order.address}</span>
                    </div>
                  </div>

                  {/* Ordered Items Summary */}
                  <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Items Ordered:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-white dark:bg-stone-950 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800"
                        >
                          <span className="font-medium text-stone-900 dark:text-stone-100">
                            {item.quantity}x {item.menuItem.nameEn}
                          </span>
                          <span className="text-stone-500 tabular-nums">
                            {item.menuItem.price * item.quantity} SAR
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
