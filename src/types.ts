import { Request } from 'express';

export interface Restaurant {
  id: string;
  name: string;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  stock: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notificationSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantContext {
  restaurantId: string;
  restaurant: Restaurant;
}

export interface TenantRequest extends Request {
  tenant?: TenantContext;
}

export interface AnalyticsResult {
  totalOrders: number;
  totalRevenue: number;
  topItems: {
    name: string;
    count: number;
    revenue: number;
  }[];
  ordersByDay: {
    date: string;
    count: number;
    revenue: number;
  }[];
}

export interface CreateMenuItemInput {
  name: string;
  description: string;
  price: number;
  category: string;
  available?: boolean;
  stock?: number | null;
}

export interface UpdateMenuItemInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  available?: boolean;
  stock?: number | null;
}

export interface CreateOrderInput {
  customerName: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
}
