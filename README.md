# Senior Backend Technical Assessment

Welcome! This exercise evaluates your debugging, optimization, and system design skills through three focused challenges.

## Getting Started

```bash
npm install
npm run dev      # Start server on port 3000
npm test         # Run all tests (they will fail initially)
```

---

## Part 1: Inventory Race Conditions (25-30 min)

**Run:** `npm run test:part1`

### Warmup

Before diving into the race conditions, there's a simpler bug to find. Order confirmation notifications aren't being sent properly.

**Symptom:** The `notificationSentAt` field is never set on orders.

**Files to examine:**
- `src/routes/orders.ts` - Order creation flow
- `src/services/notifications.ts` - Notification service

### Main Challenge

The restaurant's inventory system has multiple bugs causing race conditions and overselling. When concurrent orders arrive, stock isn't properly managed.

**Symptoms:**
- Orders succeed even when stock should be exhausted
- Stock counts become inconsistent
- Concurrent orders can oversell limited items

**Files to examine:**
- `src/services/inventory.ts` - Inventory management with caching
- `src/routes/orders.ts` - Order creation flow

**Hint:** Think about the timing of async operations and what happens when multiple requests arrive simultaneously.

---

## Part 2: Discussion Questions (15-20 min)

These scenario-based questions assess your debugging approach and system design thinking. Be prepared to discuss your reasoning.

### Q1: Debugging Race Conditions
*"You deploy Part 1's fix but customers report occasional duplicate order confirmations. Walk me through debugging this from first report to root cause."*

### Q2: Scaling Under Load
*"The inventory system works correctly but latency spikes to 5+ seconds during flash sales. Describe your investigation approach and what architectural changes you'd consider."*

### Q3: Production Incident
*"It's 2 AM and you get paged: analytics is returning wrong revenue totals for some restaurants, but not others. What's your incident response process?"*

### Q4: Design Challenge
*"Product wants to add daily specials with dynamic pricing that updates mid-day. Active orders should keep their original price, but the menu should show new prices in real-time. How would you design this?"*

### Q5: Code Review
*"A junior engineer proposes adding `setTimeout(100)` after database writes 'to ensure data is persisted before reading.' How do you handle this code review?"*

---

## Bonus: Performance Optimization

**Run:** `npm run test:bonus`

The analytics endpoint must complete in under 500ms with 100 orders. Currently it's too slow.

**File:** `src/routes/analytics.ts`

**Hint:** Look for N+1 query patterns and redundant iterations.

---

## API Reference

All endpoints require `X-Tenant-ID` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurants/:id/menu` | List menu items |
| POST | `/restaurants/:id/menu` | Add menu item |
| POST | `/restaurants/:id/orders` | Create order |
| GET | `/restaurants/:id/orders` | List orders |
| GET | `/restaurants/:id/analytics` | Get analytics |

## Testing

```bash
npm run test:part1    # Part 1: Inventory race conditions
npm run test:bonus    # Bonus: Performance optimization
npm test              # All tests
```
