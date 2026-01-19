import { db } from './src/db.js';
import { Restaurant, MenuItem, Order } from './src/types.js';

// Seed data for testing the multi-tenant restaurant API

export function seedDatabase(): void {
  // Clear existing data
  db.reset();

  // Create restaurants
  const restaurants: Restaurant[] = [
    {
      id: 'restaurant-a',
      name: 'Pizza Palace',
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'restaurant-b',
      name: 'Burger Barn',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'restaurant-c',
      name: 'Sushi Station',
      createdAt: new Date('2024-02-01')
    }
  ];

  restaurants.forEach(r => db.insertRestaurant(r));

  // Create menu items for Restaurant A (Pizza Palace)
  const pizzaMenuItems: MenuItem[] = [
    {
      id: 'pizza-1',
      restaurantId: 'restaurant-a',
      name: 'Margherita Pizza',
      description: 'Classic tomato and mozzarella',
      price: 12.99,
      category: 'Pizza',
      available: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'pizza-2',
      restaurantId: 'restaurant-a',
      name: 'Pepperoni Pizza',
      description: 'Loaded with pepperoni',
      price: 14.99,
      category: 'Pizza',
      available: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'pizza-3',
      restaurantId: 'restaurant-a',
      name: 'Garlic Bread',
      description: 'Crispy garlic bread with herbs',
      price: 4.99,
      category: 'Sides',
      available: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'pizza-4',
      restaurantId: 'restaurant-a',
      name: 'Caesar Salad',
      description: 'Fresh romaine with caesar dressing',
      price: 8.99,
      category: 'Salads',
      available: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  // Create menu items for Restaurant B (Burger Barn)
  const burgerMenuItems: MenuItem[] = [
    {
      id: 'burger-1',
      restaurantId: 'restaurant-b',
      name: 'Classic Burger',
      description: 'Beef patty with lettuce, tomato, onion',
      price: 10.99,
      category: 'Burgers',
      available: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'burger-2',
      restaurantId: 'restaurant-b',
      name: 'Cheese Burger',
      description: 'Classic burger with melted cheddar',
      price: 12.99,
      category: 'Burgers',
      available: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'burger-3',
      restaurantId: 'restaurant-b',
      name: 'French Fries',
      description: 'Crispy golden fries',
      price: 4.99,
      category: 'Sides',
      available: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'burger-4',
      restaurantId: 'restaurant-b',
      name: 'Onion Rings',
      description: 'Battered and fried onion rings',
      price: 5.99,
      category: 'Sides',
      available: false, // Unavailable for testing
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  // Create menu items for Restaurant C (Sushi Station)
  const sushiMenuItems: MenuItem[] = [
    {
      id: 'sushi-1',
      restaurantId: 'restaurant-c',
      name: 'California Roll',
      description: 'Crab, avocado, cucumber',
      price: 8.99,
      category: 'Rolls',
      available: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: 'sushi-2',
      restaurantId: 'restaurant-c',
      name: 'Salmon Nigiri',
      description: 'Fresh salmon over rice (2 pcs)',
      price: 6.99,
      category: 'Nigiri',
      available: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }
  ];

  [...pizzaMenuItems, ...burgerMenuItems, ...sushiMenuItems].forEach(item => db.insertMenuItem(item));

  // Create some orders for analytics testing
  const orders: Order[] = [
    // Orders for Restaurant A
    {
      id: 'order-a1',
      restaurantId: 'restaurant-a',
      customerName: 'John Doe',
      items: [
        { menuItemId: 'pizza-1', name: 'Margherita Pizza', quantity: 2, price: 12.99 },
        { menuItemId: 'pizza-3', name: 'Garlic Bread', quantity: 1, price: 4.99 }
      ],
      total: 30.97,
      status: 'delivered',
      notificationSentAt: new Date('2024-03-01'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    },
    {
      id: 'order-a2',
      restaurantId: 'restaurant-a',
      customerName: 'Jane Smith',
      items: [
        { menuItemId: 'pizza-2', name: 'Pepperoni Pizza', quantity: 1, price: 14.99 },
        { menuItemId: 'pizza-4', name: 'Caesar Salad', quantity: 1, price: 8.99 }
      ],
      total: 23.98,
      status: 'delivered',
      notificationSentAt: new Date('2024-03-02'),
      createdAt: new Date('2024-03-02'),
      updatedAt: new Date('2024-03-02')
    },
    {
      id: 'order-a3',
      restaurantId: 'restaurant-a',
      customerName: 'Bob Wilson',
      items: [
        { menuItemId: 'pizza-1', name: 'Margherita Pizza', quantity: 3, price: 12.99 }
      ],
      total: 38.97,
      status: 'confirmed',
      notificationSentAt: new Date('2024-03-03'),
      createdAt: new Date('2024-03-03'),
      updatedAt: new Date('2024-03-03')
    },
    // Orders for Restaurant B
    {
      id: 'order-b1',
      restaurantId: 'restaurant-b',
      customerName: 'Alice Johnson',
      items: [
        { menuItemId: 'burger-1', name: 'Classic Burger', quantity: 2, price: 10.99 },
        { menuItemId: 'burger-3', name: 'French Fries', quantity: 2, price: 4.99 }
      ],
      total: 31.96,
      status: 'delivered',
      notificationSentAt: new Date('2024-03-01'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    },
    {
      id: 'order-b2',
      restaurantId: 'restaurant-b',
      customerName: 'Charlie Brown',
      items: [
        { menuItemId: 'burger-2', name: 'Cheese Burger', quantity: 1, price: 12.99 }
      ],
      total: 12.99,
      status: 'pending',
      notificationSentAt: null,
      createdAt: new Date('2024-03-04'),
      updatedAt: new Date('2024-03-04')
    }
  ];

  orders.forEach(order => db.insertOrder(order));

  console.log('Database seeded successfully!');
  console.log(`  - ${restaurants.length} restaurants`);
  console.log(`  - ${db.menuItems.length} menu items`);
  console.log(`  - ${orders.length} orders`);
}

// Run seed if executed directly
seedDatabase();
