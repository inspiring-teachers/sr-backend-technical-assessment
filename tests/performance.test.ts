import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { db } from '../src/db.js';

/**
 * Part 2: Performance Optimization
 *
 * The analytics endpoint is slow due to inefficient code patterns.
 * Optimize src/routes/analytics.ts to complete in under 500ms.
 *
 * Look for:
 * - N+1 query pattern (database lookups inside loops)
 * - Redundant iterations over the same data
 * - Unnecessary data fetching
 *
 * Hint: The order items already contain the name and price data you need.
 */

describe('Part 2: Performance Optimization', () => {
  beforeEach(() => {
    db.reset();

    db.insertRestaurant({
      id: 'perf-restaurant',
      name: 'Performance Test Restaurant',
      createdAt: new Date()
    });

    // Add menu items
    for (let i = 1; i <= 5; i++) {
      db.insertMenuItem({
        id: `item-${i}`,
        restaurantId: 'perf-restaurant',
        name: `Item ${i}`,
        description: `Test item ${i}`,
        price: 10.00,
        category: 'Main',
        available: true,
        stock: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add 100 orders with varying items
    for (let i = 0; i < 100; i++) {
      const items = [];
      const itemCount = (i % 3) + 1;
      let total = 0;

      for (let j = 0; j < itemCount; j++) {
        const itemIndex = ((i + j) % 5) + 1;
        items.push({
          menuItemId: `item-${itemIndex}`,
          name: `Item ${itemIndex}`,
          quantity: 1,
          price: 10.00
        });
        total += 10.00;
      }

      db.insertOrder({
        id: `order-${i}`,
        restaurantId: 'perf-restaurant',
        customerName: `Customer ${i}`,
        items,
        total,
        status: 'delivered',
        notificationSentAt: new Date(),
        createdAt: new Date(`2024-03-${String((i % 28) + 1).padStart(2, '0')}`),
        updatedAt: new Date()
      });
    }
  });

  it('should return analytics within 500ms for 100 orders', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/restaurants/perf-restaurant/analytics')
      .set('X-Tenant-ID', 'perf-restaurant');

    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(response.body.totalOrders).toBe(100);
    expect(duration).toBeLessThan(500);
  });
});
