import { Router, Response } from 'express';
import { TenantRequest, MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from '../types.js';
import { db } from '../db.js';

const router = Router({ mergeParams: true });

// GET /restaurants/:id/menu - List all menu items
router.get('/', (req: TenantRequest, res: Response) => {
  const items = db.menuItems.filter(item => item.restaurantId === req.tenant!.restaurantId);
  res.json(items);
});

// POST /restaurants/:id/menu - Add a menu item
router.post('/', (req: TenantRequest, res: Response) => {
  const input: CreateMenuItemInput = req.body;

  // Validate required fields
  if (!input.name || !input.price || !input.category) {
    res.status(400).json({ error: 'Missing required fields: name, price, category' });
    return;
  }

  if (input.price <= 0) {
    res.status(400).json({ error: 'Price must be greater than 0' });
    return;
  }

  const newItem: MenuItem = {
    id: generateId(),
    restaurantId: req.tenant!.restaurantId,
    name: input.name,
    description: input.description || '',
    price: input.price,
    category: input.category,
    available: input.available ?? true,
    stock: input.stock ?? null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const item = db.insertMenuItem(newItem);
  res.status(201).json(item);
});

// PUT /restaurants/:id/menu/:itemId - Update a menu item
router.put('/:itemId', (req: TenantRequest, res: Response) => {
  const { itemId } = req.params;
  const input: UpdateMenuItemInput = req.body;

  const existingItem = db.findMenuItemById(itemId);

  if (!existingItem || existingItem.restaurantId !== req.tenant!.restaurantId) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  if (input.price !== undefined && input.price <= 0) {
    res.status(400).json({ error: 'Price must be greater than 0' });
    return;
  }

  const updatedItem = db.updateMenuItem(itemId, input);
  res.json(updatedItem);
});

// DELETE /restaurants/:id/menu/:itemId - Delete a menu item
router.delete('/:itemId', (req: TenantRequest, res: Response) => {
  const { itemId } = req.params;

  const existingItem = db.findMenuItemById(itemId);

  if (!existingItem || existingItem.restaurantId !== req.tenant!.restaurantId) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  db.deleteMenuItem(itemId);
  res.status(204).send();
});

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export default router;
