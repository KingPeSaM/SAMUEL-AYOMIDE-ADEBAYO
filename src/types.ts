import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  badge?: string;
  badgeColor?: string;
  imageUrl?: string;
  createdAt: Timestamp;
}

export type Page = 'home' | 'shop' | 'admin';

export interface CartItem {
  product: Product;
  quantity: number;
}
