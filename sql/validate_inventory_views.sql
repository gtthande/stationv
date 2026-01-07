-- ============================================================================
-- INVENTORY VIEWS VALIDATION SCRIPT
-- ============================================================================
-- 
-- Purpose: Test that all inventory views compile and can be queried
-- 
-- Usage: mysql -u your_user -p your_database < sql/validate_inventory_views.sql
-- ============================================================================

-- Set error handling
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- Test 1: Check if all views exist
SELECT 'Testing view existence...' AS test_step;

SELECT 
    TABLE_NAME AS view_name,
    TABLE_TYPE,
    ENGINE,
    CREATE_TIME
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

-- Test 2: Test vw_inventory_part_totals
SELECT 'Testing vw_inventory_part_totals...' AS test_step;

SELECT 
    COUNT(*) AS total_products,
    SUM(total_received) AS sum_total_received,
    SUM(in_stock) AS sum_in_stock,
    SUM(quarantine) AS sum_quarantine,
    SUM(wip) AS sum_wip,
    SUM(out) AS sum_out,
    SUM(withheld) AS sum_withheld,
    SUM(calculated_total) AS sum_calculated_total,
    SUM(balance_delta) AS sum_balance_delta
FROM vw_inventory_part_totals
LIMIT 1;

-- Test 3: Test vw_inventory_list
SELECT 'Testing vw_inventory_list...' AS test_step;

SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN status = 'Active' THEN 1 END) AS active_count,
    COUNT(CASE WHEN status = 'Quarantine' THEN 1 END) AS quarantine_count,
    COUNT(CASE WHEN status = 'Inactive' THEN 1 END) AS inactive_count
FROM vw_inventory_list
LIMIT 1;

-- Test 4: Test vw_stock_card_batches
SELECT 'Testing vw_stock_card_batches...' AS test_step;

SELECT 
    COUNT(*) AS total_batches,
    COUNT(DISTINCT product_id) AS unique_products,
    COUNT(CASE WHEN status_category = 'In Stock' THEN 1 END) AS in_stock_batches,
    COUNT(CASE WHEN status_category = 'Quarantine' THEN 1 END) AS quarantine_batches
FROM vw_stock_card_batches
LIMIT 1;

-- Test 5: Test vw_stock_card_wip
SELECT 'Testing vw_stock_card_wip...' AS test_step;

SELECT 
    COUNT(*) AS total_wip_allocations,
    COUNT(DISTINCT product_id) AS unique_products_in_wip,
    COUNT(DISTINCT job_card_id) AS unique_job_cards,
    SUM(quantity) AS total_wip_quantity
FROM vw_stock_card_wip
LIMIT 1;

-- Test 6: Test vw_stock_card_movements
SELECT 'Testing vw_stock_card_movements...' AS test_step;

SELECT 
    COUNT(*) AS total_movements,
    COUNT(DISTINCT product_id) AS unique_products,
    COUNT(DISTINCT transaction_type) AS unique_transaction_types,
    MIN(transaction_date) AS earliest_transaction,
    MAX(transaction_date) AS latest_transaction
FROM vw_stock_card_movements
LIMIT 1;

-- Test 7: Verify reconciliation formula
-- Formula: total_received = in_stock + quarantine + wip + out + withheld
SELECT 'Testing reconciliation formula...' AS test_step;

SELECT 
    product_id,
    part_number,
    total_received,
    in_stock,
    quarantine,
    wip,
    out,
    withheld,
    calculated_total,
    balance_delta,
    CASE 
        WHEN ABS(balance_delta) < 0.01 THEN 'BALANCED'
        ELSE 'IMBALANCED'
    END AS reconciliation_status
FROM vw_inventory_part_totals
WHERE ABS(balance_delta) >= 0.01
LIMIT 10;

-- Test 8: Sample data from each view
SELECT 'Sample data from vw_inventory_list (first 5 products)...' AS test_step;

SELECT 
    product_id,
    part_number,
    product_name,
    total_received,
    in_stock,
    quarantine,
    wip,
    out,
    status,
    batch_count
FROM vw_inventory_list
LIMIT 5;

SELECT 'All tests completed successfully!' AS result;

