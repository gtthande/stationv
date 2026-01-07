-- ============================================================================
-- VALIDATION QUERIES: Verify All Inventory States
-- ============================================================================
-- 
-- Purpose: Read-only validation queries to verify test data created correctly
-- 
-- Run these queries AFTER executing:
-- - 01_quarantine_test.sql
-- - 02_wip_test.sql
-- - 03_out_test.sql
-- - 04_withheld_test.sql
-- 
-- Expected Results:
-- - All states (In Stock, Quarantine, WIP, Out, Withheld) appear
-- - No negative stock
-- - FIFO preserved
-- - TOTAL = In + Quarantine + WIP + Out + Withheld
-- ============================================================================

-- ============================================================================
-- VALIDATION 1: Inventory List View
-- ============================================================================
-- Check that all products show correct state breakdowns

SELECT 
    product_id,
    part_number,
    product_name,
    total_received,
    in_stock,
    quarantine,
    wip,
    out,
    withheld,
    calculated_total,
    balance_delta,
    status,
    batch_count,
    CASE 
        WHEN ABS(balance_delta) < 0.01 THEN '✓ BALANCED'
        ELSE '✗ IMBALANCED'
    END AS reconciliation_status
FROM vw_inventory_list
WHERE 
    in_stock > 0 
    OR quarantine > 0 
    OR wip > 0 
    OR out > 0 
    OR withheld > 0
ORDER BY 
    CASE 
        WHEN quarantine > 0 THEN 1
        WHEN wip > 0 THEN 2
        WHEN out > 0 THEN 3
        WHEN withheld > 0 THEN 4
        ELSE 5
    END,
    part_number;

-- ============================================================================
-- VALIDATION 2: Inventory Part Totals View
-- ============================================================================
-- Detailed breakdown per product

SELECT 
    product_id,
    part_number,
    product_name,
    unit_of_measure,
    total_received,
    in_stock,
    quarantine,
    wip,
    out,
    withheld,
    calculated_total,
    balance_delta,
    -- Verify formula: total_received = in_stock + quarantine + wip + out + withheld
    (in_stock + quarantine + wip + out + withheld) AS manual_total,
    ABS(total_received - (in_stock + quarantine + wip + out + withheld)) AS formula_check
FROM vw_inventory_part_totals
WHERE 
    in_stock > 0 
    OR quarantine > 0 
    OR wip > 0 
    OR out > 0 
    OR withheld > 0
ORDER BY part_number;

-- ============================================================================
-- VALIDATION 3: Stock Card Batches View
-- ============================================================================
-- Verify batch statuses and quantities

SELECT 
    batch_id,
    product_id,
    part_number,
    product_name,
    batch_code,
    status,
    status_category,
    received_quantity,
    remaining_quantity,
    quantity_issued,
    warehouse_name,
    supplier_name,
    received_at,
    approved_at
FROM vw_stock_card_batches
WHERE product_id IN (
    SELECT DISTINCT product_id 
    FROM vw_inventory_list 
    WHERE quarantine > 0 OR wip > 0 OR out > 0 OR withheld > 0
)
ORDER BY product_id, received_at ASC;

-- ============================================================================
-- VALIDATION 4: Stock Card WIP View
-- ============================================================================
-- Verify WIP allocations (parts issued to OPEN jobs)

SELECT 
    job_card_part_id,
    job_card_id,
    job_number,
    job_title,
    job_status,
    batch_id,
    batch_code,
    product_id,
    part_number,
    product_name,
    quantity,
    issued_at,
    customer_name,
    aircraft_reg
FROM vw_stock_card_wip
ORDER BY product_id, issued_at DESC;

-- Summary of WIP by product
SELECT 
    product_id,
    part_number,
    product_name,
    COUNT(DISTINCT job_card_id) AS open_job_count,
    COUNT(*) AS wip_line_count,
    SUM(quantity) AS total_wip_quantity
FROM vw_stock_card_wip
GROUP BY product_id, part_number, product_name
ORDER BY total_wip_quantity DESC;

-- ============================================================================
-- VALIDATION 5: Stock Card Movements View
-- ============================================================================
-- Verify transaction history, especially adjustments

SELECT 
    transaction_id,
    batch_id,
    batch_code,
    product_id,
    part_number,
    product_name,
    transaction_type,
    direction,
    quantity,
    adjustment_reason_code,
    adjustment_reason_description,
    transaction_status,
    notes,
    transaction_date,
    created_at
FROM vw_stock_card_movements
WHERE product_id IN (
    SELECT DISTINCT product_id 
    FROM vw_inventory_list 
    WHERE withheld > 0 OR wip > 0 OR out > 0
)
ORDER BY product_id, transaction_date DESC, created_at DESC;

-- Summary of adjustments (withheld)
SELECT 
    product_id,
    part_number,
    product_name,
    COUNT(*) AS adjustment_count,
    SUM(ABS(quantity)) AS total_withheld,
    MIN(transaction_date) AS first_adjustment,
    MAX(transaction_date) AS last_adjustment
FROM vw_stock_card_movements
WHERE transaction_type = 'ADJUSTMENT'
  AND quantity < 0
  AND transaction_status = 'APPROVED'
GROUP BY product_id, part_number, product_name
ORDER BY total_withheld DESC;

-- ============================================================================
-- VALIDATION 6: Check for Negative Stock
-- ============================================================================
-- Should return no rows if data is valid

SELECT 
    product_id,
    part_number,
    product_name,
    in_stock,
    quarantine,
    wip,
    out,
    withheld,
    calculated_total
FROM vw_inventory_part_totals
WHERE in_stock < 0 
   OR quarantine < 0 
   OR wip < 0 
   OR out < 0 
   OR withheld < 0
   OR calculated_total < 0;

-- Check batch remaining quantities
SELECT 
    batch_id,
    batch_code,
    product_id,
    part_number,
    received_quantity,
    remaining_quantity,
    quantity_issued,
    status
FROM vw_stock_card_batches
WHERE remaining_quantity < 0;

-- ============================================================================
-- VALIDATION 7: FIFO Verification
-- ============================================================================
-- Verify that batches are ordered by received_at (FIFO)

SELECT 
    product_id,
    part_number,
    batch_id,
    batch_code,
    received_at,
    status,
    remaining_quantity,
    ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY received_at ASC) AS fifo_order
FROM vw_stock_card_batches
WHERE product_id IN (
    SELECT DISTINCT product_id 
    FROM vw_inventory_list 
    WHERE batch_count > 1
)
ORDER BY product_id, received_at ASC;

-- ============================================================================
-- VALIDATION 8: Test Data Identification
-- ============================================================================
-- Identify all test data created

-- Test customers
SELECT 
    id,
    name,
    code,
    created_at
FROM customers
WHERE name LIKE '%TEST%' OR code LIKE 'TEST-%'
ORDER BY created_at DESC;

-- Test job cards
SELECT 
    id,
    job_number,
    title,
    status,
    customer_id,
    opened_at,
    closed_at
FROM job_cards
WHERE job_number LIKE 'TEST-%' OR title LIKE '%TEST%'
ORDER BY opened_at DESC;

-- Test job card parts
SELECT 
    jcp.id,
    jcp.job_card_id,
    jc.job_number,
    jc.title AS job_title,
    jcp.batch_id,
    b.batch_code,
    jcp.product_id,
    p.part_number,
    jcp.quantity,
    jcp.created_at
FROM job_card_parts jcp
INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
INNER JOIN batches b ON jcp.batch_id = b.id
INNER JOIN products p ON jcp.product_id = p.id
WHERE jc.job_number LIKE 'TEST-%' OR jc.title LIKE '%TEST%'
ORDER BY jcp.created_at DESC;

-- Test adjustments
SELECT 
    it.id,
    it.batch_id,
    b.batch_code,
    it.product_id,
    p.part_number,
    it.transaction_type,
    it.quantity,
    it.stock_adjustment_reason_id,
    sar.code AS reason_code,
    it.notes,
    it.transaction_date
FROM inventory_transactions it
INNER JOIN batches b ON it.batch_id = b.id
INNER JOIN products p ON b.product_id = p.id
LEFT JOIN stock_adjustment_reasons sar ON it.stock_adjustment_reason_id = sar.id
WHERE it.notes LIKE '%TEST%' OR sar.code = 'TEST'
ORDER BY it.transaction_date DESC;

-- ============================================================================
-- VALIDATION 9: Reconciliation Summary
-- ============================================================================
-- Overall reconciliation status

SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN ABS(balance_delta) < 0.01 THEN 1 END) AS balanced_count,
    COUNT(CASE WHEN ABS(balance_delta) >= 0.01 THEN 1 END) AS imbalanced_count,
    SUM(total_received) AS sum_total_received,
    SUM(in_stock) AS sum_in_stock,
    SUM(quarantine) AS sum_quarantine,
    SUM(wip) AS sum_wip,
    SUM(out) AS sum_out,
    SUM(withheld) AS sum_withheld,
    SUM(calculated_total) AS sum_calculated_total,
    SUM(balance_delta) AS sum_balance_delta
FROM vw_inventory_part_totals
WHERE in_stock > 0 OR quarantine > 0 OR wip > 0 OR out > 0 OR withheld > 0;

-- ============================================================================
-- VALIDATION 10: State Coverage Check
-- ============================================================================
-- Verify that all states are represented in test data

SELECT 
    'In Stock' AS state,
    COUNT(*) AS product_count,
    SUM(in_stock) AS total_quantity
FROM vw_inventory_part_totals
WHERE in_stock > 0

UNION ALL

SELECT 
    'Quarantine' AS state,
    COUNT(*) AS product_count,
    SUM(quarantine) AS total_quantity
FROM vw_inventory_part_totals
WHERE quarantine > 0

UNION ALL

SELECT 
    'WIP' AS state,
    COUNT(*) AS product_count,
    SUM(wip) AS total_quantity
FROM vw_inventory_part_totals
WHERE wip > 0

UNION ALL

SELECT 
    'Out' AS state,
    COUNT(*) AS product_count,
    SUM(out) AS total_quantity
FROM vw_inventory_part_totals
WHERE out > 0

UNION ALL

SELECT 
    'Withheld' AS state,
    COUNT(*) AS product_count,
    SUM(withheld) AS total_quantity
FROM vw_inventory_part_totals
WHERE withheld > 0

ORDER BY state;

-- ============================================================================
-- VALIDATION COMPLETE
-- ============================================================================
-- If all validations pass:
-- ✓ All states appear in inventory views
-- ✓ No negative stock detected
-- ✓ FIFO ordering preserved
-- ✓ Reconciliation formula balances (total_received = in_stock + quarantine + wip + out + withheld)
-- ✓ Test data clearly identified
-- 
-- Next Steps:
-- - Verify in UI that all states display correctly
-- - Check that stock cards show correct breakdowns
-- - Confirm that charts/reports reflect the test data
-- ============================================================================

