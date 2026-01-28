import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { db } from '../src/db.js';
import { clearCache, clearReservations } from '../src/services/inventory.js';

/**
 * Part 1: Inventory Race Conditions
 *
 * The ordering system has inventory tracking, but it contains multiple bugs
 * that cause race conditions, overselling, and data inconsistencies.
 *
 * Files to examine:
 * - src/services/inventory.ts
 * - src/routes/orders.ts
 */

describe('Part 1: Inventory Race Conditions', () => {
  describe('Warmup', () => {
    beforeEach(() => {
      db.reset();
      clearCache();
      clearReservations();

      db.insertRestaurant({
        id: 'test-restaurant',
        name: 'Test Restaurant',
        createdAt: new Date()
      });

      db.insertMenuItem({
        id: 'test-item',
        restaurantId: 'test-restaurant',
        name: 'Test Burger',
        description: 'A test burger',
        price: 10.99,
        category: 'Burgers',
        available: true,
        stock: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should set notificationSentAt when creating an order', async () => {
      const response = await request(app)
        .post('/restaurants/test-restaurant/orders')
        .set('X-Tenant-ID', 'test-restaurant')
        .send({
          customerName: 'Test Customer',
          items: [{ menuItemId: 'test-item', quantity: 1 }]
        });

      expect(response.status).toBe(201);

      // Wait for async notification to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      const order = db.findOrderById(response.body.id);
      expect(order?.notificationSentAt).not.toBeNull();
    });
  });


  beforeEach(() => {
    db.reset();
    clearCache();
    clearReservations();

    db.insertRestaurant({
      id: 'test-restaurant',
      name: 'Test Restaurant',
      createdAt: new Date()
    });

    db.insertMenuItem({
      id: 'limited-item',
      restaurantId: 'test-restaurant',
      name: 'Limited Burger',
      description: 'A burger with limited stock',
      price: 15.99,
      category: 'Burgers',
      available: true,
      stock: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    db.insertMenuItem({
      id: 'unlimited-item',
      restaurantId: 'test-restaurant',
      name: 'Unlimited Fries',
      description: 'Fries with no stock limit',
      price: 4.99,
      category: 'Sides',
      available: true,
      stock: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  it('should decrement stock after successful order', async () => {
    const response = await request(app)
      .post('/restaurants/test-restaurant/orders')
      .set('X-Tenant-ID', 'test-restaurant')
      .send({
        customerName: 'Test Customer',
        items: [{ menuItemId: 'limited-item', quantity: 2 }]
      });

    expect(response.status).toBe(201);

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    const menuItem = db.findMenuItemById('limited-item');
    expect(menuItem?.stock).toBe(3); // 5 - 2 = 3
  });

  it('should reject order when insufficient stock', async () => {
    const response = await request(app)
      .post('/restaurants/test-restaurant/orders')
      .set('X-Tenant-ID', 'test-restaurant')
      .send({
        customerName: 'Test Customer',
        items: [{ menuItemId: 'limited-item', quantity: 10 }]
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Insufficient stock');

    // Stock should remain unchanged
    const menuItem = db.findMenuItemById('limited-item');
    expect(menuItem?.stock).toBe(5);
  });

  it('should not oversell on concurrent orders', async () => {
    // Send 3 concurrent orders, each requesting 2 items (total: 6)
    // Only 5 in stock, so at least one should fail
    const orders = await Promise.all([
      request(app)
        .post('/restaurants/test-restaurant/orders')
        .set('X-Tenant-ID', 'test-restaurant')
        .send({
          customerName: 'Customer 1',
          items: [{ menuItemId: 'limited-item', quantity: 2 }]
        }),
      request(app)
        .post('/restaurants/test-restaurant/orders')
        .set('X-Tenant-ID', 'test-restaurant')
        .send({
          customerName: 'Customer 2',
          items: [{ menuItemId: 'limited-item', quantity: 2 }]
        }),
      request(app)
        .post('/restaurants/test-restaurant/orders')
        .set('X-Tenant-ID', 'test-restaurant')
        .send({
          customerName: 'Customer 3',
          items: [{ menuItemId: 'limited-item', quantity: 2 }]
        })
    ]);

    // Wait for all async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const successfulOrders = orders.filter(r => r.status === 201);
    const failedOrders = orders.filter(r => r.status === 400);

    // At most 2 orders should succeed (2 + 2 = 4 <= 5)
    expect(successfulOrders.length).toBeLessThanOrEqual(2);
    expect(failedOrders.length).toBeGreaterThanOrEqual(1);

    // Stock should not go negative
    const menuItem = db.findMenuItemById('limited-item');
    expect(menuItem?.stock).toBeGreaterThanOrEqual(0);

    // Total sold should not exceed original stock
    const totalSold = successfulOrders.length * 2;
    expect(totalSold).toBeLessThanOrEqual(5);
  });

  it('should release stock when order partially fails', async () => {
    // Add a second item with very limited stock
    db.insertMenuItem({
      id: 'rare-item',
      restaurantId: 'test-restaurant',
      name: 'Rare Steak',
      description: 'Very limited availability',
      price: 49.99,
      category: 'Specials',
      available: true,
      stock: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // First order takes the rare item
    await request(app)
      .post('/restaurants/test-restaurant/orders')
      .set('X-Tenant-ID', 'test-restaurant')
      .send({
        customerName: 'Customer 1',
        items: [{ menuItemId: 'rare-item', quantity: 1 }]
      });

    await new Promise(resolve => setTimeout(resolve, 50));

    // Second order tries to get both limited-item and rare-item
    // Should fail because rare-item is out of stock
    const response = await request(app)
      .post('/restaurants/test-restaurant/orders')
      .set('X-Tenant-ID', 'test-restaurant')
      .send({
        customerName: 'Customer 2',
        items: [
          { menuItemId: 'limited-item', quantity: 2 },
          { menuItemId: 'rare-item', quantity: 1 }
        ]
      });

    await new Promise(resolve => setTimeout(resolve, 50));

    // The limited-item stock should NOT be decremented since the order failed
    const menuItem = db.findMenuItemById('limited-item');
    expect(menuItem?.stock).toBe(5);
  });

  it('should correctly exhaust stock with sequential orders', async () => {
    // Place orders sequentially until stock is exhausted
    for (let i = 0; i < 3; i++) {
      const response = await request(app)
        .post('/restaurants/test-restaurant/orders')
        .set('X-Tenant-ID', 'test-restaurant')
        .send({
          customerName: `Customer ${i + 1}`,
          items: [{ menuItemId: 'limited-item', quantity: 2 }]
        });

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      if (i < 2) {
        // First two orders should succeed (2 + 2 = 4 <= 5)
        expect(response.status).toBe(201);
      } else {
        // Third order should fail (would need 6 total, only 5 available)
        expect(response.status).toBe(400);
      }
    }

    // Final stock should be 1 (5 - 2 - 2 = 1)
    const menuItem = db.findMenuItemById('limited-item');
    expect(menuItem?.stock).toBe(1);
  });
});
