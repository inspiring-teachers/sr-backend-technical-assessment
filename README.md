# Senior Backend Technical Assessment

Welcome! This exercise evaluates your debugging and optimization skills through three focused challenges.

## Getting Started

```bash
npm install
npm run dev      # Start server on port 3000
npm test         # Run all tests (they will fail initially)
```

---

## Part 1: Warmup - "The Silent Failure" (10-15 min)

**Run:** `npm run test:part1`

When an order is created, the `notificationSentAt` field should be set. But it's always `null`.

**File:** `src/routes/orders.ts`

**Hint:** Think about async/await behavior.

---

## Part 2: Multi-tenant Architecture Discussion (10-15 min)

This is a discussion-based exercise. Review the existing tenant middleware in `src/middleware/tenant.ts` and be prepared to discuss:

1. **Walk me through how you'd implement tenant isolation in this system.**
   - How would you ensure one tenant can never access another's data?

2. **What are the tradeoffs between row-level security vs separate schemas vs separate databases?**
   - Which would you recommend for this use case and why?

3. **How would you handle a tenant trying to access another tenant's data?**
   - What logging/alerting would you add?

4. **What changes would be needed if we wanted to add tenant-specific feature flags?**
   - How would you structure the configuration?

5. **How would you approach tenant data migration or deletion?**
   - What considerations are important for GDPR compliance?

**Reference:** `src/middleware/tenant.ts`, `src/routes/*.ts`

---

## Part 3: Performance Optimization (15-20 min)

**Run:** `npm run test:part3`

The analytics endpoint must complete in under 500ms with 100 orders. Currently it's too slow.

**File:** `src/routes/analytics.ts`

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
npm run test:part1    # Part 1 only
npm run test:part3    # Part 3 only
npm test              # All tests
```
