import express from 'express';
import menuRoutes from './routes/menu.js';
import ordersRoutes from './routes/orders.js';
import analyticsRoutes from './routes/analytics.js';
import { tenantMiddleware, requireTenant } from './middleware/tenant.js';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply tenant middleware to all restaurant routes
app.use('/restaurants/:id', tenantMiddleware, requireTenant);

// Restaurant routes
app.use('/restaurants/:id/menu', menuRoutes);
app.use('/restaurants/:id/orders', ordersRoutes);
app.use('/restaurants/:id/analytics', analyticsRoutes);

// Get restaurant info
app.get('/restaurants/:id', (req, res) => {
  const restaurant = db.findRestaurantById(req.params.id);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  res.json(restaurant);
});

// List all restaurants (for testing/debugging)
app.get('/restaurants', (req, res) => {
  res.json(db.restaurants);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Only start server if this file is run directly (not imported by tests)
const isMainModule = process.argv[1]?.includes('index.ts') || process.argv[1]?.includes('index.js');

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET  /health');
    console.log('  GET  /restaurants');
    console.log('  GET  /restaurants/:id');
    console.log('  GET  /restaurants/:id/menu');
    console.log('  POST /restaurants/:id/menu');
    console.log('  PUT  /restaurants/:id/menu/:itemId');
    console.log('  DELETE /restaurants/:id/menu/:itemId');
    console.log('  GET  /restaurants/:id/orders');
    console.log('  POST /restaurants/:id/orders');
    console.log('  GET  /restaurants/:id/orders/:orderId');
    console.log('  GET  /restaurants/:id/analytics');
  });
}

export { app };
