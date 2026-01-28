import { db } from '../db.js';
import { MenuItem } from '../types.js';

/**
 * Inventory Service
 * Manages stock levels for menu items
 */

// In-memory cache for stock levels
const stockCache: Map<string, { stock: number; cachedAt: number }> = new Map();

// Track reservations (stock held during order processing)
const reservations: Map<string, Map<string, number>> = new Map(); // orderId -> (menuItemId -> quantity)

/**
 * Get current stock level for a menu item
 */
export function getStock(menuItemId: string): number | null {
  // Check cache first
  const cached = stockCache.get(menuItemId);
  if (cached) {
    return cached.stock;
  }

  // Fetch from database
  const item = db.findMenuItemById(menuItemId);
  if (!item) return null;

  // Cache the result
  stockCache.set(menuItemId, {
    stock: item.stock ?? 0,
    cachedAt: Date.now()
  });

  return item.stock;
}

/**
 * Check if sufficient stock exists for an order
 */
export function checkStock(menuItemId: string, quantity: number): boolean {
  const currentStock = getStock(menuItemId);
  if (currentStock === null) return false;

  return currentStock >= quantity;
}

/**
 * Reserve stock for an order (holds stock during order processing)
 */
export async function reserveStock(
  orderId: string,
  items: Array<{ menuItemId: string; quantity: number }>
): Promise<boolean> {
  // Simulate async operation (e.g., distributed lock acquisition)
  await new Promise(resolve => setTimeout(resolve, 15));

  const orderReservations = new Map<string, number>();

  for (const item of items) {
    const menuItem = db.findMenuItemById(item.menuItemId);
    if (!menuItem || menuItem.stock === null) continue;

    const currentStock = menuItem.stock;
    const alreadyReserved = getTotalReserved(item.menuItemId);
    const available = currentStock - alreadyReserved;

    if (available < item.quantity) {
      return false;
    }

    orderReservations.set(item.menuItemId, item.quantity);
  }

  // Store reservations for this order
  reservations.set(orderId, orderReservations);
  return true;
}

/**
 * Commit reservation - actually decrement stock after successful order
 */
export async function commitReservation(orderId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 5));

  const orderReservations = reservations.get(orderId);
  if (!orderReservations) return;

  for (const [menuItemId, quantity] of orderReservations) {
    const menuItem = db.findMenuItemById(menuItemId);
    if (!menuItem || menuItem.stock === null) continue;

    // Decrement actual stock
    db.updateMenuItem(menuItemId, {
      stock: menuItem.stock - quantity
    });

    // Invalidate cache
    stockCache.delete(menuItemId);
  }

  // Clear reservation
  reservations.delete(orderId);
}

/**
 * Release reservation - return reserved stock (e.g., on order failure)
 */
export function releaseReservation(orderId: string): void {
  reservations.delete(orderId);
}

/**
 * Get total reserved quantity for a menu item across all pending orders
 */
function getTotalReserved(menuItemId: string): number {
  let total = 0;
  for (const orderReservations of reservations.values()) {
    total += orderReservations.get(menuItemId) || 0;
  }
  return total;
}

/**
 * Clear inventory cache (useful for testing)
 */
export function clearCache(): void {
  stockCache.clear();
}

/**
 * Clear all reservations (useful for testing)
 */
export function clearReservations(): void {
  reservations.clear();
}
