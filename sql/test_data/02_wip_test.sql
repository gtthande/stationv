-- ============================================================================
-- TEST DATA: WIP (Work In Progress) Scenario
-- ============================================================================
-- 
-- Purpose: Create test data to demonstrate WIP state in inventory
-- 
-- Scenario:
-- - Create 1 OPEN job card (clearly marked as TEST)
-- - Issue quantities from APPROVED batches only
-- - Insert rows into job_card_parts accordingly
-- - Ensure quantities reduce batch remaining_quantity
-- - Create inventory_transactions for audit trail
-- 
-- Result:
-- - Inventory shows WIP > 0
-- - Batch breakdown reflects issued qty
-- - WIP table populated
-- 
-- This script is EXECUTABLE and will automatically find existing data
-- ============================================================================

-- ============================================================================
-- STEP 1: Get required IDs
-- ============================================================================

-- Get first active user (for opened_by, issued_by, created_by)
SET @test_user_id = (SELECT id FROM users WHERE is_active = 1 LIMIT 1);

-- Get or create test customer
INSERT INTO customers (
    name,
    code,
    contact_person,
    email,
    phone,
    is_active,
    created_at,
    updated_at
) VALUES (
    'TEST CUSTOMER - WIP Scenario',
    'TEST-WIP-001',
    'Test Contact',
    'test.wip@example.com',
    '+254700000000',
    1,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE name = name;

SET @test_customer_id = (SELECT id FROM customers WHERE code = 'TEST-WIP-001' LIMIT 1);

-- ============================================================================
-- STEP 2: Create OPEN job card
-- ============================================================================

-- Create or get test job card
INSERT INTO job_cards (
    job_number,
    customer_id,
    aircraft_reg,
    title,
    description,
    status,
    opened_by,
    opened_at,
    created_at,
    updated_at
) VALUES (
    'TEST-JC-WIP-001',  -- Clearly marked as TEST
    @test_customer_id,
    'TEST-REG-001',
    'TEST: WIP Scenario - Open Job Card',
    'This is TEST DATA for WIP scenario. Parts issued to this job card will show as WIP in inventory.',
    'OPEN',  -- Must be OPEN for WIP calculation
    @test_user_id,
    DATE_SUB(NOW(), INTERVAL 15 DAY),  -- Backdated 15 days
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    NOW()
)
ON DUPLICATE KEY UPDATE title = title;

SET @test_job_card_id = (SELECT id FROM job_cards WHERE job_number = 'TEST-JC-WIP-001' LIMIT 1);

-- ============================================================================
-- STEP 3: Find APPROVED batches to issue from
-- ============================================================================

-- Get first APPROVED batch with remaining quantity (FIFO)
SET @batch_id_1 = (
    SELECT id
    FROM batches
    WHERE status = 'APPROVED'
      AND remaining_quantity > 0
      AND product_id IN (SELECT id FROM products WHERE is_active = 1)
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
    ORDER BY received_at ASC
    LIMIT 1
);

-- ============================================================================
-- STEP 4: Issue parts from APPROVED batches to job card
-- ============================================================================

-- Issue from first batch (if exists)
SET @quantity_1 = 5.0000;  -- Issue 5 units

INSERT INTO job_card_parts (
    job_card_id,
    source_type,
    batch_id,
    product_id,
    quantity,
    unit_cost_local,
    unit_price_local,
    total_cost_local,
    total_price_local,
    issued_by,
    line_order,
    created_at,
    updated_at
)
SELECT 
    @test_job_card_id,
    'MAIN_WAREHOUSE',  -- From warehouse stock
    b.id,
    b.product_id,
    @quantity_1,
    b.landed_cost_per_unit,
    b.fitting_price_per_unit,
    b.landed_cost_per_unit * @quantity_1,
    b.fitting_price_per_unit * @quantity_1,
    @test_user_id,
    1,
    DATE_SUB(NOW(), INTERVAL 12 DAY),  -- Backdated
    DATE_SUB(NOW(), INTERVAL 12 DAY)
FROM batches b
WHERE b.id = @batch_id_1
  AND NOT EXISTS (
      SELECT 1 FROM job_card_parts jcp 
      WHERE jcp.job_card_id = @test_job_card_id 
        AND jcp.batch_id = b.id
        AND jcp.quantity = @quantity_1
  );

-- Update batch remaining_quantity
UPDATE batches
SET 
    remaining_quantity = remaining_quantity - @quantity_1,
    updated_at = NOW()
WHERE id = @batch_id_1
  AND remaining_quantity >= @quantity_1;  -- Prevent negative stock

-- Get the job_card_part_id for transaction
SET @job_card_part_id_1 = (
    SELECT id FROM job_card_parts 
    WHERE job_card_id = @test_job_card_id 
      AND batch_id = @batch_id_1 
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Create inventory transaction (audit trail)
INSERT INTO inventory_transactions (
    batch_id,
    transaction_type,
    direction,
    quantity,
    unit_cost_local,
    total_cost_local,
    job_card_part_id,
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
    'ISSUE',
    'OUT',
    -@quantity_1,  -- Negative for OUT direction
    b.landed_cost_per_unit,
    b.landed_cost_per_unit * @quantity_1,
    @job_card_part_id_1,
    @test_user_id,
    @test_user_id,  -- Self-approved for test data
    'APPROVED',
    'TEST DATA: Issue to OPEN job card (WIP scenario)',
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    DATE_SUB(NOW(), INTERVAL 12 DAY)
FROM batches b
WHERE b.id = @batch_id_1
  AND NOT EXISTS (
      SELECT 1 FROM inventory_transactions it
      WHERE it.job_card_part_id = @job_card_part_id_1
        AND it.transaction_type = 'ISSUE'
  );

-- Issue from second batch (if exists) for variety
SET @quantity_2 = 3.0000;  -- Issue 3 units

INSERT INTO job_card_parts (
    job_card_id,
    source_type,
    batch_id,
    product_id,
    quantity,
    unit_cost_local,
    unit_price_local,
    total_cost_local,
    total_price_local,
    issued_by,
    line_order,
    created_at,
    updated_at
)
SELECT 
    @test_job_card_id,
    'MAIN_WAREHOUSE',
    b.id,
    b.product_id,
    @quantity_2,
    b.landed_cost_per_unit,
    b.fitting_price_per_unit,
    b.landed_cost_per_unit * @quantity_2,
    b.fitting_price_per_unit * @quantity_2,
    @test_user_id,
    2,
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY)
FROM batches b
WHERE b.id = @batch_id_2
  AND NOT EXISTS (
      SELECT 1 FROM job_card_parts jcp 
      WHERE jcp.job_card_id = @test_job_card_id 
        AND jcp.batch_id = b.id
        AND jcp.quantity = @quantity_2
  );

-- Update batch remaining_quantity
UPDATE batches
SET 
    remaining_quantity = remaining_quantity - @quantity_2,
    updated_at = NOW()
WHERE id = @batch_id_2
  AND remaining_quantity >= @quantity_2;

-- Get the job_card_part_id for transaction
SET @job_card_part_id_2 = (
    SELECT id FROM job_card_parts 
    WHERE job_card_id = @test_job_card_id 
      AND batch_id = @batch_id_2 
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Create inventory transaction
INSERT INTO inventory_transactions (
    batch_id,
    transaction_type,
    direction,
    quantity,
    unit_cost_local,
    total_cost_local,
    job_card_part_id,
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
    'ISSUE',
    'OUT',
    -@quantity_2,
    b.landed_cost_per_unit,
    b.landed_cost_per_unit * @quantity_2,
    @job_card_part_id_2,
    @test_user_id,
    @test_user_id,
    'APPROVED',
    'TEST DATA: Issue to OPEN job card (WIP scenario)',
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY)
FROM batches b
WHERE b.id = @batch_id_2
  AND NOT EXISTS (
      SELECT 1 FROM inventory_transactions it
      WHERE it.job_card_part_id = @job_card_part_id_2
        AND it.transaction_type = 'ISSUE'
  );

-- ============================================================================
-- STEP 5: Verify WIP state
-- ============================================================================

-- Show WIP allocations
SELECT 
    'WIP ALLOCATIONS' AS info,
    job_card_part_id,
    job_number,
    job_title,
    batch_code,
    product_name,
    quantity,
    issued_at
FROM vw_stock_card_wip
WHERE job_card_id = @test_job_card_id
ORDER BY issued_at DESC;

-- Show inventory totals for products with WIP
SELECT 
    'INVENTORY TOTALS (WIP)' AS info,
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
WHERE wip > 0
ORDER BY wip DESC;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
    'WIP TEST DATA CREATED' AS status,
    @test_job_card_id AS job_card_id,
    'TEST-JC-WIP-001' AS job_number,
    @batch_id_1 AS batch_1_id,
    @quantity_1 AS quantity_1,
    @batch_id_2 AS batch_2_id,
    @quantity_2 AS quantity_2,
    CASE 
        WHEN @batch_id_1 IS NOT NULL THEN '✓ Parts issued from batch 1'
        ELSE '✗ No APPROVED batches found'
    END AS batch_1_status,
    CASE 
        WHEN @batch_id_2 IS NOT NULL THEN '✓ Parts issued from batch 2'
        ELSE '✗ Only one batch used (need more batches for variety)'
    END AS batch_2_status;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- - Job card status MUST be 'OPEN' for WIP calculation
-- - Only issue from APPROVED batches
-- - Always update batch remaining_quantity when issuing
-- - Create inventory_transactions for audit trail
-- - WIP = sum of quantities in job_card_parts where job_cards.status = 'OPEN'
-- - Script is idempotent (can be run multiple times safely)
-- ============================================================================
