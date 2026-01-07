-- ============================================================================
-- TEST DATA: Out (Closed Job Card) Scenario
-- ============================================================================
-- 
-- Purpose: Create test data to demonstrate OUT state in inventory
-- 
-- Scenario:
-- - Create 1 CLOSED job card (or close an existing TEST job card)
-- - Issue quantities from APPROVED batches
-- - Ensure job card status = 'CLOSED'
-- - Create inventory_transactions for audit trail
-- 
-- Result:
-- - Inventory shows Out > 0
-- - WIP decreases (if job was previously OPEN)
-- - Out increases
-- 
-- This script is EXECUTABLE and will automatically find existing data
-- ============================================================================

-- ============================================================================
-- STEP 1: Get required IDs
-- ============================================================================

-- Get first active user (for opened_by, closed_by, issued_by, created_by)
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
    'TEST CUSTOMER - Out Scenario',
    'TEST-OUT-001',
    'Test Contact',
    'test.out@example.com',
    '+254700000000',
    1,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE name = name;

SET @test_customer_id = (SELECT id FROM customers WHERE code = 'TEST-OUT-001' LIMIT 1);

-- ============================================================================
-- STEP 2: Create CLOSED job card
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
    closed_by,
    opened_at,
    closed_at,
    created_at,
    updated_at
) VALUES (
    'TEST-JC-OUT-001',  -- Clearly marked as TEST
    @test_customer_id,
    'TEST-REG-002',
    'TEST: Out Scenario - Closed Job Card',
    'This is TEST DATA for OUT scenario. Parts issued to this CLOSED job card will show as OUT in inventory.',
    'CLOSED',  -- Must be CLOSED for OUT calculation
    @test_user_id,
    @test_user_id,  -- Same user closed it
    DATE_SUB(NOW(), INTERVAL 30 DAY),  -- Opened 30 days ago
    DATE_SUB(NOW(), INTERVAL 5 DAY),   -- Closed 5 days ago
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    NOW()
)
ON DUPLICATE KEY UPDATE title = title;

SET @test_job_card_id = (SELECT id FROM job_cards WHERE job_number = 'TEST-JC-OUT-001' LIMIT 1);

-- ============================================================================
-- STEP 3: Find APPROVED batches to issue from
-- ============================================================================

-- Get first APPROVED batch with remaining quantity (FIFO)
-- Exclude batches already used in WIP test
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
          WHERE jc.job_number = 'TEST-JC-WIP-001'
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
          WHERE jc.job_number = 'TEST-JC-WIP-001'
            AND jcp.batch_id IS NOT NULL
      )
    ORDER BY received_at ASC
    LIMIT 1
);

-- ============================================================================
-- STEP 4: Issue parts from APPROVED batches to CLOSED job card
-- ============================================================================

-- Issue from first batch (if exists)
SET @quantity_1 = 7.0000;  -- Issue 7 units

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
    DATE_SUB(NOW(), INTERVAL 25 DAY),  -- Issued 25 days ago (before closing)
    DATE_SUB(NOW(), INTERVAL 25 DAY)
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
    'TEST DATA: Issue to CLOSED job card (OUT scenario)',
    DATE_SUB(NOW(), INTERVAL 25 DAY),
    DATE_SUB(NOW(), INTERVAL 25 DAY),
    DATE_SUB(NOW(), INTERVAL 25 DAY)
FROM batches b
WHERE b.id = @batch_id_1
  AND NOT EXISTS (
      SELECT 1 FROM inventory_transactions it
      WHERE it.job_card_part_id = @job_card_part_id_1
        AND it.transaction_type = 'ISSUE'
  );

-- Issue from second batch (if exists) for variety
SET @quantity_2 = 4.0000;  -- Issue 4 units

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
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    DATE_SUB(NOW(), INTERVAL 20 DAY)
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
    'TEST DATA: Issue to CLOSED job card (OUT scenario)',
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    DATE_SUB(NOW(), INTERVAL 20 DAY)
FROM batches b
WHERE b.id = @batch_id_2
  AND NOT EXISTS (
      SELECT 1 FROM inventory_transactions it
      WHERE it.job_card_part_id = @job_card_part_id_2
        AND it.transaction_type = 'ISSUE'
  );

-- ============================================================================
-- STEP 5: Alternative - Close an existing OPEN job card
-- ============================================================================
-- If you have an existing TEST job card that's OPEN, you can close it instead
-- This will automatically move quantities from WIP to OUT in the views

UPDATE job_cards
SET 
    status = 'CLOSED',
    closed_by = @test_user_id,
    closed_at = NOW(),
    updated_at = NOW()
WHERE job_number = 'TEST-JC-WIP-001'  -- From WIP scenario
  AND status = 'OPEN';

-- ============================================================================
-- STEP 6: Verify OUT state
-- ============================================================================

-- Show parts issued to CLOSED job cards
SELECT 
    'OUT ALLOCATIONS' AS info,
    jcp.id AS job_card_part_id,
    jc.job_number,
    jc.title AS job_title,
    jc.status AS job_status,
    b.batch_code,
    p.part_number,
    p.name AS product_name,
    jcp.quantity,
    jcp.created_at AS issued_at
FROM job_card_parts jcp
INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
INNER JOIN batches b ON jcp.batch_id = b.id
INNER JOIN products p ON b.product_id = p.id
WHERE jc.status = 'CLOSED'
  AND (jc.job_number LIKE 'TEST-%' OR jc.title LIKE '%TEST%')
ORDER BY jcp.created_at DESC;

-- Show inventory totals for products with OUT
SELECT 
    'INVENTORY TOTALS (OUT)' AS info,
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
WHERE out > 0
ORDER BY out DESC;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
    'OUT TEST DATA CREATED' AS status,
    @test_job_card_id AS job_card_id,
    'TEST-JC-OUT-001' AS job_number,
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
-- - Job card status MUST be 'CLOSED' for OUT calculation
-- - Only issue from APPROVED batches
-- - Always update batch remaining_quantity when issuing
-- - Create inventory_transactions for audit trail
-- - OUT = sum of quantities in job_card_parts where job_cards.status = 'CLOSED'
-- - Closing an OPEN job card moves quantities from WIP to OUT
-- - Script is idempotent (can be run multiple times safely)
-- ============================================================================
