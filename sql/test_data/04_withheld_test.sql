-- ============================================================================
-- TEST DATA: Withheld (Adjustments) Scenario
-- ============================================================================
-- 
-- Purpose: Create test data to demonstrate WITHHELD state in inventory
-- 
-- Scenario:
-- - Insert at least 2 inventory_transactions:
--   - transaction_type = 'ADJUSTMENT'
--   - quantity < 0 (negative)
--   - status = 'APPROVED'
-- - Use different dates and small quantities
-- 
-- Result:
-- - Withheld > 0 in inventory views
-- - Reconciliation still balances
-- 
-- This script is EXECUTABLE and will automatically find existing data
-- ============================================================================

-- ============================================================================
-- STEP 1: Get or create stock adjustment reasons
-- ============================================================================

-- Create adjustment reasons if they don't exist
INSERT INTO stock_adjustment_reasons (code, description)
VALUES 
    ('DAMAGE', 'Item damaged during handling'),
    ('LOSS', 'Item lost or missing'),
    ('EXPIRED', 'Item expired before use'),
    ('QUALITY', 'Quality issue - not fit for use'),
    ('TEST', 'TEST DATA - Adjustment for testing')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Get adjustment reason IDs
SET @damage_reason_id = (SELECT id FROM stock_adjustment_reasons WHERE code = 'DAMAGE' LIMIT 1);
SET @loss_reason_id = (SELECT id FROM stock_adjustment_reasons WHERE code = 'LOSS' LIMIT 1);
SET @expired_reason_id = (SELECT id FROM stock_adjustment_reasons WHERE code = 'EXPIRED' LIMIT 1);
SET @test_reason_id = (SELECT id FROM stock_adjustment_reasons WHERE code = 'TEST' LIMIT 1);

-- ============================================================================
-- STEP 2: Get required IDs
-- ============================================================================

-- Get first active user (for created_by, approved_by)
SET @test_user_id = (SELECT id FROM users WHERE is_active = 1 LIMIT 1);

-- Find APPROVED batches with remaining quantity
-- Exclude batches already used in WIP/OUT tests
SET @batch_id_1 = (
    SELECT id
    FROM batches
    WHERE status = 'APPROVED'
      AND remaining_quantity > 0
      AND product_id IN (SELECT id FROM products WHERE is_active = 1)
      AND id NOT IN (
          SELECT DISTINCT batch_id 
          FROM job_card_parts jcp
          INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
          WHERE (jc.job_number = 'TEST-JC-WIP-001' OR jc.job_number = 'TEST-JC-OUT-001')
            AND jcp.batch_id IS NOT NULL
      )
    ORDER BY received_at ASC
    LIMIT 1
);

-- Get second APPROVED batch (if exists) for variety
SET @batch_id_2 = (
    SELECT id
    FROM batches
    WHERE status = 'APPROVED'
      AND remaining_quantity > 0
      AND product_id IN (SELECT id FROM products WHERE is_active = 1)
      AND id != IFNULL(@batch_id_1, 0)
      AND id NOT IN (
          SELECT DISTINCT batch_id 
          FROM job_card_parts jcp
          INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
          WHERE (jc.job_number = 'TEST-JC-WIP-001' OR jc.job_number = 'TEST-JC-OUT-001')
            AND jcp.batch_id IS NOT NULL
      )
    ORDER BY received_at ASC
    LIMIT 1
);

-- Get product IDs for the batches
SET @product_id_1 = (SELECT product_id FROM batches WHERE id = @batch_id_1);
SET @product_id_2 = (SELECT product_id FROM batches WHERE id = @batch_id_2);

-- ============================================================================
-- STEP 3: Create negative adjustment transactions
-- ============================================================================

-- Adjustment 1: Damage (2 units) - 20 days ago
SET @adjustment_qty_1 = -2.0000;  -- Negative quantity for adjustment

INSERT INTO inventory_transactions (
    batch_id,
    transaction_type,
    direction,
    quantity,
    unit_cost_local,
    total_cost_local,
    stock_adjustment_reason_id,
    created_by,
    approved_by,
    status,
    notes,
    transaction_date,
    created_at,
    updated_at
)
SELECT 
    b.id,
    'ADJUSTMENT',
    'OUT',
    @adjustment_qty_1,
    b.landed_cost_per_unit,
    ABS(b.landed_cost_per_unit * @adjustment_qty_1),  -- Total cost is positive
    @damage_reason_id,
    @test_user_id,
    @test_user_id,  -- Self-approved for test data
    'APPROVED',
    'TEST DATA: Damage adjustment - 2 units damaged during handling',
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    DATE_SUB(NOW(), INTERVAL 20 DAY)
FROM batches b
WHERE b.id = @batch_id_1
  AND NOT EXISTS (
      SELECT 1 FROM inventory_transactions it
      WHERE it.batch_id = b.id
        AND it.transaction_type = 'ADJUSTMENT'
        AND it.quantity = @adjustment_qty_1
        AND it.stock_adjustment_reason_id = @damage_reason_id
        AND DATE(it.transaction_date) = DATE(DATE_SUB(NOW(), INTERVAL 20 DAY))
  );

-- Adjustment 2: Loss (1 unit) - 10 days ago (same batch or different)
SET @adjustment_qty_2 = -1.0000;

INSERT INTO inventory_transactions (
    batch_id,
    transaction_type,
    direction,
    quantity,
    unit_cost_local,
    total_cost_local,
    stock_adjustment_reason_id,
    created_by,
    approved_by,
    status,
    notes,
    transaction_date,
    created_at,
    updated_at
)
SELECT 
    b.id,
    'ADJUSTMENT',
    'OUT',
    @adjustment_qty_2,
    b.landed_cost_per_unit,
    ABS(b.landed_cost_per_unit * @adjustment_qty_2),
    @loss_reason_id,
    @test_user_id,
    @test_user_id,
    'APPROVED',
    'TEST DATA: Loss adjustment - 1 unit lost',
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY)
FROM batches b
WHERE b.id = @batch_id_1  -- Use same batch for second adjustment
  AND NOT EXISTS (
      SELECT 1 FROM inventory_transactions it
      WHERE it.batch_id = b.id
        AND it.transaction_type = 'ADJUSTMENT'
        AND it.quantity = @adjustment_qty_2
        AND it.stock_adjustment_reason_id = @loss_reason_id
        AND DATE(it.transaction_date) = DATE(DATE_SUB(NOW(), INTERVAL 10 DAY))
  );

-- Adjustment 3: Expired (1 unit) - 5 days ago (different batch if available)
SET @adjustment_qty_3 = -1.0000;

INSERT INTO inventory_transactions (
    batch_id,
    transaction_type,
    direction,
    quantity,
    unit_cost_local,
    total_cost_local,
    stock_adjustment_reason_id,
    created_by,
    approved_by,
    status,
    notes,
    transaction_date,
    created_at,
    updated_at
)
SELECT 
    b.id,
    'ADJUSTMENT',
    'OUT',
    @adjustment_qty_3,
    b.landed_cost_per_unit,
    ABS(b.landed_cost_per_unit * @adjustment_qty_3),
    @expired_reason_id,
    @test_user_id,
    @test_user_id,
    'APPROVED',
    'TEST DATA: Expired adjustment - 1 unit expired before use',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY)
FROM batches b
WHERE b.id = IFNULL(@batch_id_2, @batch_id_1)  -- Use second batch if available, else first
  AND NOT EXISTS (
      SELECT 1 FROM inventory_transactions it
      WHERE it.batch_id = b.id
        AND it.transaction_type = 'ADJUSTMENT'
        AND it.quantity = @adjustment_qty_3
        AND it.stock_adjustment_reason_id = @expired_reason_id
        AND DATE(it.transaction_date) = DATE(DATE_SUB(NOW(), INTERVAL 5 DAY))
  );

-- ============================================================================
-- STEP 4: Verify WITHHELD state
-- ============================================================================

-- Show adjustment transactions
SELECT 
    'ADJUSTMENT TRANSACTIONS' AS info,
    transaction_id,
    batch_code,
    product_name,
    transaction_type,
    direction,
    quantity,
    adjustment_reason_code,
    adjustment_reason_description,
    transaction_status,
    notes,
    transaction_date
FROM vw_stock_card_movements
WHERE transaction_type = 'ADJUSTMENT'
  AND quantity < 0
  AND transaction_status = 'APPROVED'
  AND (notes LIKE '%TEST%' OR adjustment_reason_code IN ('DAMAGE', 'LOSS', 'EXPIRED', 'TEST'))
ORDER BY transaction_date DESC;

-- Show inventory totals for products with WITHHELD
SELECT 
    'INVENTORY TOTALS (WITHHELD)' AS info,
    product_id,
    part_number,
    product_name,
    in_stock,
    quarantine,
    wip,
    out,
    withheld,
    calculated_total,
    balance_delta
FROM vw_inventory_part_totals
WHERE withheld > 0
ORDER BY withheld DESC;

-- Summary of adjustments by product
SELECT 
    'ADJUSTMENT SUMMARY' AS info,
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
  AND (notes LIKE '%TEST%' OR adjustment_reason_code IN ('DAMAGE', 'LOSS', 'EXPIRED', 'TEST'))
GROUP BY product_id, part_number, product_name
ORDER BY total_withheld DESC;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
    'WITHHELD TEST DATA CREATED' AS status,
    @batch_id_1 AS batch_1_id,
    @product_id_1 AS product_1_id,
    @adjustment_qty_1 AS adjustment_1_qty,
    @adjustment_qty_2 AS adjustment_2_qty,
    @batch_id_2 AS batch_2_id,
    @product_id_2 AS product_2_id,
    @adjustment_qty_3 AS adjustment_3_qty,
    CASE 
        WHEN @batch_id_1 IS NOT NULL THEN '✓ Adjustments created for batch 1'
        ELSE '✗ No APPROVED batches found'
    END AS batch_1_status,
    CASE 
        WHEN @batch_id_2 IS NOT NULL THEN '✓ Adjustments created for batch 2'
        ELSE '✗ Only one batch used (need more batches for variety)'
    END AS batch_2_status;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- - WITHHELD = SUM(ABS(quantity)) WHERE transaction_type = 'ADJUSTMENT' 
--   AND quantity < 0 AND status = 'APPROVED'
-- - Adjustments must have negative quantities
-- - Adjustments must be APPROVED to count in WITHHELD
-- - Batch remaining_quantity doesn't need to be updated for WITHHELD calculation
-- - Use different dates to spread adjustments over time
-- - WITHHELD represents stock that was received but cannot be accounted for 
--   in other states
-- - Script is idempotent (can be run multiple times safely)
-- ============================================================================
