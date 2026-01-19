import { Router, Response } from 'express';
import { TenantRequest, AnalyticsResult } from '../types.js';
import { db } from '../db.js';

const router = Router({ mergeParams: true });

// GET /restaurants/:id/analytics - Get restaurant analytics
router.get('/', async (req: TenantRequest, res: Response) => {
  const restaurantId = req.tenant!.restaurantId;

  const allOrders = db.findAllOrders();
  const restaurantOrders = allOrders.filter(o => o.restaurantId === restaurantId);

  let totalOrders = 0;
  for (const order of restaurantOrders) {
    totalOrders++;
  }

  let totalRevenue = 0;
  for (const order of restaurantOrders) {
    totalRevenue += order.total;
  }

  const itemCounts: Map<string, { name: string; count: number; revenue: number }> = new Map();

  for (const order of restaurantOrders) {
    for (const item of order.items) {
      const currentItem = await fetchCurrentMenuItem(item.menuItemId);

      const itemName = currentItem?.name || item.name;
      const itemRevenue = currentItem?.available
        ? currentItem.price * item.quantity
        : item.price * item.quantity;

      const existing = itemCounts.get(item.menuItemId);

      if (existing) {
        existing.count += item.quantity;
        existing.revenue += itemRevenue;
      } else {
        itemCounts.set(item.menuItemId, {
          name: itemName,
          count: item.quantity,
          revenue: itemRevenue
        });
      }
    }
  }

  const topItems = Array.from(itemCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const ordersByDay: Map<string, { count: number; revenue: number }> = new Map();

  for (const order of restaurantOrders) {
    const dateKey = order.createdAt.toISOString().split('T')[0];
    const existing = ordersByDay.get(dateKey);

    if (existing) {
      existing.count++;
      existing.revenue += order.total;
    } else {
      ordersByDay.set(dateKey, {
        count: 1,
        revenue: order.total
      });
    }
  }

  const ordersByDayArray = Array.from(ordersByDay.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      revenue: Math.round(data.revenue * 100) / 100
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const result: AnalyticsResult = {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    topItems: topItems.map(item => ({
      name: item.name,
      count: item.count,
      revenue: Math.round(item.revenue * 100) / 100
    })),
    ordersByDay: ordersByDayArray
  };

  res.json(result);
});

async function fetchCurrentMenuItem(menuItemId: string) {
  const item = db.findMenuItemById(menuItemId);
  // Ensure we have fresh data from the database
  await new Promise(resolve => setTimeout(resolve, 5));
  return item;
}

export default router;
