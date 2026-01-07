-- ============================================================================
-- HELPER QUERY: Find Target Parts for Test Data
-- ============================================================================
-- 
-- Purpose: Identify existing products with MULTIPLE batches that we can use
--          for test data scenarios
-- 
-- Usage: Run this query FIRST to identify product IDs and batch IDs to use
-- ============================================================================

-- Find products with multiple batches (preferred for test data)
SELECT 
    p.id AS product_id,
    p.part_number,
    p.name AS product_name,
    COUNT(b.id) AS batch_count,
    SUM(CASE WHEN b.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_batches,
    SUM(CASE WHEN b.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_batches,
    SUM(CASE WHEN b.status = 'QUARANTINED' THEN 1 ELSE 0 END) AS quarantined_batches,
    SUM(b.remaining_quantity) AS total_remaining,
    MIN(b.received_at) AS earliest_batch_date,
    MAX(b.received_at) AS latest_batch_date
FROM products p
INNER JOIN batches b ON p.id = b.product_id
WHERE p.is_active = 1
GROUP BY p.id, p.part_number, p.name
HAVING batch_count >= 2  -- At least 2 batches
ORDER BY batch_count DESC, total_remaining DESC
LIMIT 10;

-- Get detailed batch information for selected products
-- Replace @PRODUCT_ID with actual product_id from above query
SELECT 
    b.id AS batch_id,
    b.product_id,
    p.part_number,
    p.name AS product_name,
    b.batch_code,
    b.status,
    b.received_quantity,
    b.remaining_quantity,
    b.warehouse_id,
    w.name AS warehouse_name,
    b.supplier_id,
    s.name AS supplier_name,
    b.received_by,
    b.approved_by,
    b.received_at,
    b.approved_at
FROM batches b
INNER JOIN products p ON b.product_id = p.id
LEFT JOIN warehouses w ON b.warehouse_id = w.id
LEFT JOIN suppliers s ON b.supplier_id = s.id
WHERE b.product_id = @PRODUCT_ID  -- Replace with actual product_id
ORDER BY b.received_at ASC;

-- Get available users (for received_by, approved_by, issued_by)
SELECT 
    id,
    email,
    name,
    is_active,
    is_admin
FROM users
WHERE is_active = 1
ORDER BY id
LIMIT 10;

-- Get available customers (for job cards)
SELECT 
    id,
    name,
    code,
    is_active
FROM customers
WHERE is_active = 1
ORDER BY id
LIMIT 10;

-- Get available warehouses
SELECT 
    id,
    name,
    code,
    is_active
FROM warehouses
WHERE is_active = 1
ORDER BY id;

-- Get available suppliers
SELECT 
    id,
    name,
    code,
    is_active
FROM suppliers
WHERE is_active = 1
ORDER BY id
LIMIT 10;

-- Get stock adjustment reasons (for withheld scenario)
SELECT 
    id,
    code,
    description
FROM stock_adjustment_reasons
ORDER BY id;

