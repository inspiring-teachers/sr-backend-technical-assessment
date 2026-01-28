import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { db } from '../src/db.js';

/**
 * Part 1: Warmup - "The Silent Failure"
 *
 * When an order is created, a confirmation notification should be sent.
 * The notification service updates the `notificationSentAt` field.
 * However, something is wrong - the field is always `null`.
 *
 * Hint: Look at how async operations are handled in src/routes/orders.ts
 */

describe('Part 1: Warmup - Order Notifications', () => {
  beforeEach(() => {
    db.reset();

    db.insertRestaurant({
      id: 'test-restaurant',
      name: 'Test Restaurant',
      createdAt: new Date()
    });

    db.insertMenuItem({
      id: 'test-item',
      restaurantId: 'test-restaurant',
      name: 'Test Burger',
      description: 'A delicious test burger',
      price: 9.99,
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
        items: [{ menuItemId: 'test-item', quantity: 2 }]
      });

    expect(response.status).toBe(201);
    expect(response.body.notificationSentAt).not.toBeNull();
  });
});
