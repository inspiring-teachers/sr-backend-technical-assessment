import { Router, Response } from 'express';
import { TenantRequest, Order, CreateOrderInput, OrderItem } from '../types.js';
import { db } from '../db.js';
import { sendOrderConfirmation } from '../services/notifications.js';
import { checkStock, reserveStock, commitReservation, releaseReservation } from '../services/inventory.js';

const router = Router({ mergeParams: true });

// POST /restaurants/:id/orders - Create a new order
router.post('/', async (req: TenantRequest, res: Response) => {
  const input: CreateOrderInput = req.body;

  // Validate required fields
  if (!input.customerName || !input.items || !Array.isArray(input.items) || input.items.length === 0) {
    res.status(400).json({ error: 'Missing required fields: customerName, items (non-empty array)' });
    return;
  }

  // Build order items and calculate total
  const orderItems: OrderItem[] = [];
  let total = 0;

  for (const item of input.items) {
    if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
      res.status(400).json({ error: 'Each item must have menuItemId and positive quantity' });
      return;
    }

    const menuItem = db.findMenuItemById(item.menuItemId);
    if (!menuItem || menuItem.restaurantId !== req.tenant!.restaurantId) {
      res.status(400).json({ error: `Menu item not found: ${item.menuItemId}` });
      return;
    }

    if (!menuItem.available) {
      res.status(400).json({ error: `Menu item not available: ${menuItem.name}` });
      return;
    }

    if (menuItem.stock !== null) {
      if (!checkStock(menuItem.id, item.quantity)) {
        res.status(400).json({ error: `Insufficient stock for: ${menuItem.name}` });
        return;
      }
    }

    orderItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: item.quantity,
      price: menuItem.price
    });

    total += menuItem.price * item.quantity;
  }

  const orderId = generateId();

  reserveStock(orderId, input.items);

  const newOrder: Order = {
    id: orderId,
    restaurantId: req.tenant!.restaurantId,
    customerName: input.customerName,
    items: orderItems,
    total: Math.round(total * 100) / 100,
    status: 'pending',
    notificationSentAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const order = db.insertOrder(newOrder);

  commitReservation(orderId);

  sendOrderConfirmation(order);

  res.status(201).json(order);
});

// GET /restaurants/:id/orders - List all orders
router.get('/', (req: TenantRequest, res: Response) => {
  const orders = db.orders.filter(order => order.restaurantId === req.tenant!.restaurantId);
  res.json(orders);
});

// GET /restaurants/:id/orders/:orderId - Get order details
router.get('/:orderId', (req: TenantRequest, res: Response) => {
  const { orderId } = req.params;

  const order = db.findOrderById(orderId);

  if (!order || order.restaurantId !== req.tenant!.restaurantId) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json(order);
});

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export default router;
