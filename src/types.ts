export interface MenuItem {
  id: string;
  nameEn: string;
  nameUr: string;
  category: 'nashta' | 'daal_sabzi' | 'chicken' | 'chai_lassi' | 'beverages';
  price: number; // in SAR
  description: string;
  image: string;
  popular?: boolean;
  spicyLevel?: 0 | 1 | 2 | 3;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSpice?: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId?: string;
  customerName: string;
  phone?: string;
  address?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cod' | 'card';
  status: 'Received' | 'Preparing' | 'Ready' | 'Delivered';
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}
