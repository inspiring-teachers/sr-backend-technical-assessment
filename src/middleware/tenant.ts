import { Response, NextFunction } from 'express';
import { TenantRequest } from '../types.js';
import { db } from '../db.js';

// Tenant middleware to extract and validate tenant context
export function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction): void {
  const tenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;

  const restaurantId = req.params.id || tenantId;

  const restaurant = db.findRestaurantById(restaurantId);

  if (restaurant) {
    req.tenant = {
      restaurantId: restaurant.id,
      restaurant: restaurant
    };
  }

  next();
}

// Middleware to ensure tenant context exists
export function requireTenant(req: TenantRequest, res: Response, next: NextFunction): void {
  if (!req.tenant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }

  next();
}
