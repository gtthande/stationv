# Inventory Setup Instructions

## Problem
The inventory list page shows "No inventory items found" even though test data exists.

## Root Cause
The MySQL views (`vw_inventory_list`, `vw_inventory_part_totals`, etc.) need to be created in the database. The UI code queries these views, but if they don't exist, the API returns an empty array.

## Solution

### Step 1: Run Diagnostic Script
First, check what's missing:

```bash
mysql -u your_user -p stationv_clean < sql/check_inventory_setup.sql
```

This will tell you:
- ✓ Which views exist
- ✓ How many products/batches are in the database
- ✓ Whether views return data

### Step 2: Create the Views
If views don't exist, create them:

```bash
mysql -u your_user -p stationv_clean < sql/inventory_views.sql
```

This creates all 5 required views:
- `vw_inventory_part_totals` - Aggregated totals per product
- `vw_inventory_list` - List of all products with totals (used by inventory list page)
- `vw_stock_card_batches` - All batches for a product (used by detail page)
- `vw_stock_card_wip` - WIP allocations
- `vw_stock_card_movements` - Transaction movements

### Step 3: Verify Views Work
Run the validation script:

```bash
mysql -u your_user -p stationv_clean < sql/validate_inventory_views.sql
```

This will:
- ✓ Confirm all views exist
- ✓ Show sample data from each view
- ✓ Verify reconciliation formulas

### Step 4: Check Data Requirements
The views require:
1. **Products** table with `is_active = 1`
2. **Batches** table with products linked
3. **Warehouses** table (for batch locations)
4. **Suppliers** table (optional, for batch supplier info)

Verify you have test data:

```sql
-- Check products
SELECT COUNT(*) as total_products, 
       COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_products
FROM products;

-- Check batches
SELECT COUNT(*) as total_batches,
       COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
       COUNT(CASE WHEN status = 'QUARANTINED' THEN 1 END) as quarantined
FROM batches;
```

### Step 5: Restart Dev Server
After creating views, restart your Next.js dev server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 6: Check Browser Console
Open browser DevTools → Console and look for:
- `[API] GET /api/inventory - Raw result count: X` (should be > 0)
- Any error messages

## Expected Result
After setup:
- `/dashboard/inventory` should show a populated table
- Each row shows: Part Number, Product Name, In Stock, Quarantine, WIP, Out, Withheld, Status, Batches
- Status badges: Green (APPROVED/Active), Amber (QUARANTINED), Grey (DEPLETED)
- Clicking a part number shows detail page with batches, WIP (if exists), and movements

## Troubleshooting

### Views exist but return 0 rows
- Check if `products.is_active = 1` for products with batches
- Verify batches are linked to products via `batches.product_id`
- Check if warehouses exist (batches require `warehouse_id`)

### API returns error
- Check server console for SQL errors
- Verify database connection string in `.env`
- Check MySQL user has SELECT permissions on views

### UI still shows empty
- Hard refresh browser (Ctrl+Shift+R)
- Check Network tab → `/api/inventory` → Response
- Verify API returns JSON array (not error object)

