import { Restaurant, MenuItem, Order } from './types.js';

// In-memory database storage
class Database {
  restaurants: Restaurant[] = [];
  menuItems: MenuItem[] = [];
  orders: Order[] = [];

  // Restaurant operations
  findRestaurantById(id: string): Restaurant | undefined {
    return this.restaurants.find(r => r.id === id);
  }

  insertRestaurant(restaurant: Restaurant): Restaurant {
    this.restaurants.push(restaurant);
    return restaurant;
  }

  // Menu item operations
  findAllMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  findMenuItemById(id: string): MenuItem | undefined {
    return this.menuItems.find(item => item.id === id);
  }

  insertMenuItem(item: MenuItem): MenuItem {
    this.menuItems.push(item);
    return item;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | undefined {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) return undefined;

    this.menuItems[index] = {
      ...this.menuItems[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.menuItems[index];
  }

  deleteMenuItem(id: string): boolean {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.menuItems.splice(index, 1);
    return true;
  }

  // Order operations
  findAllOrders(): Order[] {
    return this.orders;
  }

  findOrderById(id: string): Order | undefined {
    return this.orders.find(order => order.id === id);
  }

  insertOrder(order: Order): Order {
    this.orders.push(order);
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) return undefined;

    this.orders[index] = {
      ...this.orders[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.orders[index];
  }

  // Reset database (useful for testing)
  reset(): void {
    this.restaurants = [];
    this.menuItems = [];
    this.orders = [];
  }
}

// Export singleton instance
export const db = new Database();
