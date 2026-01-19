import { Order } from '../types.js';
import { db } from '../db.js';

// Simulated notification service
// In a real app, this would send emails, SMS, push notifications, etc.

export async function sendOrderConfirmation(order: Order): Promise<void> {
  // Simulate async operation (e.g., calling external notification API)
  await new Promise(resolve => setTimeout(resolve, 10));

  // Update order with notification sent timestamp
  db.updateOrder(order.id, {
    notificationSentAt: new Date()
  });

  console.log(`[Notification] Order confirmation sent for order ${order.id} to ${order.customerName}`);
}

export async function sendOrderStatusUpdate(order: Order, newStatus: string): Promise<void> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 10));

  console.log(`[Notification] Status update sent for order ${order.id}: ${newStatus}`);
}
