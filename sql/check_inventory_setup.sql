-- ============================================================================
-- INVENTORY SETUP DIAGNOSTIC SCRIPT
-- ============================================================================
-- 
-- Purpose: Check if inventory views exist and if data is available
-- Run this to diagnose why inventory list is empty
-- 
-- Usage: mysql -u your_user -p stationv_clean < sql/check_inventory_setup.sql
-- ============================================================================

SELECT '=== DIAGNOSTIC: Inventory Setup Check ===' AS '';
SELECT '' AS '';

-- Step 1: Check if views exist
SELECT 'STEP 1: Checking if views exist...' AS '';
SELECT 
    TABLE_NAME AS view_name,
    CASE 
        WHEN TABLE_NAME IS NOT NULL THEN '✓ EXISTS'
        ELSE '✗ MISSING'
    END AS status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'vw_inventory_part_totals',
    'vw_inventory_list',
    'vw_stock_card_batches',
    'vw_stock_card_wip',
    'vw_stock_card_movements'
  )
ORDER BY TABLE_NAME;

SELECT '' AS '';

-- Step 2: Check if base tables have data
SELECT 'STEP 2: Checking base table data...' AS '';
SELECT 
    'products' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN is_active = 1 THEN 1 END) AS active_products
FROM products
UNION ALL
SELECT 
    'batches' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) AS approved_batches
FROM batches
UNION ALL
SELECT 
    'batches' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN status = 'QUARANTINED' THEN 1 END) AS quarantined_batches
FROM batches;

SELECT '' AS '';

-- Step 3: Check if views return data (if they exist)
SELECT 'STEP 3: Checking if views return data...' AS '';

-- Check vw_inventory_list
SELECT 
    'vw_inventory_list' AS view_name,
    COUNT(*) AS row_count
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'vw_inventory_list'
HAVING COUNT(*) > 0;

-- If view exists, try to query it
SET @view_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'vw_inventory_list'
);

SELECT '' AS '';
SELECT 
    CASE 
        WHEN @view_exists > 0 THEN 'View exists - checking data...'
        ELSE 'View does NOT exist - need to create it!'
    END AS status;

-- If view exists, show sample data
SELECT '' AS '';
SELECT 'Sample data from vw_inventory_list (if exists):' AS '';
SELECT 
    product_id,
    part_number,
    product_name,
    in_stock,
    quarantine,
    status,
    batch_count
FROM vw_inventory_list
LIMIT 5;

SELECT '' AS '';
SELECT '=== DIAGNOSIS COMPLETE ===' AS '';
SELECT '' AS '';
SELECT 
    CASE 
        WHEN @view_exists = 0 THEN 
            '❌ ACTION REQUIRED: Views do not exist. Run sql/inventory_views.sql to create them.'
        WHEN (SELECT COUNT(*) FROM vw_inventory_list) = 0 THEN
            '❌ ACTION REQUIRED: Views exist but return no data. Check if products and batches exist.'
        ELSE 
            '✓ Views exist and have data. Check API/UI code if still not showing.'
    END AS recommendation;

