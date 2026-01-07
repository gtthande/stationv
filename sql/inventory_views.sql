-- ============================================================================
-- INVENTORY VIEWS - MySQL Source of Truth
-- ============================================================================
-- 
-- Purpose: Create read-only MySQL views that match the Inventory UI logic exactly
-- 
-- Views:
-- 1. vw_inventory_part_totals - Aggregated totals per product
-- 2. vw_inventory_list - List of all products with totals and status
-- 3. vw_stock_card_batches - All batches for a product
-- 4. vw_stock_card_wip - WIP allocations (parts issued to OPEN jobs)
-- 5. vw_stock_card_movements - Transaction movements/audit trail
--
-- Logic matches: lib/inventory/calculations.ts
-- Formula: TOTAL = IN STOCK + QUARANTINE + WIP + OUT + WITHHELD
-- ============================================================================

-- ============================================================================
-- VIEW 1: vw_inventory_part_totals
-- ============================================================================
-- Aggregated inventory totals per product
-- Used for: Summary calculations, reconciliation checks
-- ============================================================================

CREATE OR REPLACE VIEW vw_inventory_part_totals AS
SELECT 
    p.id AS product_id,
    p.part_number,
    p.name AS product_name,
    p.description,
    p.unit_of_measure,
    
    -- Total Received: Sum of all batch quantities received
    COALESCE(SUM(b.received_quantity), 0) AS total_received,
    
    -- In Stock: Approved batches remaining quantity
    COALESCE(SUM(
        CASE 
            WHEN b.status = 'APPROVED' THEN b.remaining_quantity
            ELSE 0
        END
    ), 0) AS in_stock,
    
    -- Quarantine: PENDING or QUARANTINED batches remaining quantity
    COALESCE(SUM(
        CASE 
            WHEN b.status IN ('PENDING', 'QUARANTINED') THEN b.remaining_quantity
            ELSE 0
        END
    ), 0) AS quarantine,
    
    -- WIP: Parts issued to OPEN jobs (job_cards.status = 'OPEN')
    COALESCE((
        SELECT SUM(jcp.quantity)
        FROM job_card_parts jcp
        INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
        INNER JOIN batches b_wip ON jcp.batch_id = b_wip.id
        WHERE b_wip.product_id = p.id
          AND jc.status = 'OPEN'
          AND jcp.batch_id IS NOT NULL
    ), 0) AS wip,
    
    -- Out: Parts issued to CLOSED jobs (job_cards.status = 'CLOSED')
    COALESCE((
        SELECT SUM(jcp.quantity)
        FROM job_card_parts jcp
        INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
        INNER JOIN batches b_out ON jcp.batch_id = b_out.id
        WHERE b_out.product_id = p.id
          AND jc.status = 'CLOSED'
          AND jcp.batch_id IS NOT NULL
    ), 0) AS out,
    
    -- Withheld: Negative adjustments from inventory_transactions
    -- Logic matches UI: type === 'ADJUSTMENT' && qty < 0
    COALESCE((
        SELECT SUM(ABS(it.quantity))
        FROM inventory_transactions it
        INNER JOIN batches b_wh ON it.batch_id = b_wh.id
        WHERE b_wh.product_id = p.id
          AND it.transaction_type = 'ADJUSTMENT'
          AND it.quantity < 0
          AND it.status = 'APPROVED'
    ), 0) AS withheld,
    
    -- Calculated total (in_stock + quarantine + wip + out + withheld)
    -- Note: Using subqueries to reference already-calculated values would require
    -- a derived table, so we reference the same calculations for consistency
    (
        COALESCE(SUM(
            CASE 
                WHEN b.status = 'APPROVED' THEN b.remaining_quantity
                ELSE 0
            END
        ), 0) + 
        COALESCE(SUM(
            CASE 
                WHEN b.status IN ('PENDING', 'QUARANTINED') THEN b.remaining_quantity
                ELSE 0
            END
        ), 0) +
        COALESCE((
            SELECT SUM(jcp.quantity)
            FROM job_card_parts jcp
            INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
            INNER JOIN batches b_wip ON jcp.batch_id = b_wip.id
            WHERE b_wip.product_id = p.id
              AND jc.status = 'OPEN'
              AND jcp.batch_id IS NOT NULL
        ), 0) +
        COALESCE((
            SELECT SUM(jcp.quantity)
            FROM job_card_parts jcp
            INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
            INNER JOIN batches b_out ON jcp.batch_id = b_out.id
            WHERE b_out.product_id = p.id
              AND jc.status = 'CLOSED'
              AND jcp.batch_id IS NOT NULL
        ), 0) +
        COALESCE((
            SELECT SUM(ABS(it.quantity))
            FROM inventory_transactions it
            INNER JOIN batches b_wh ON it.batch_id = b_wh.id
            WHERE b_wh.product_id = p.id
              AND it.transaction_type = 'ADJUSTMENT'
              AND it.quantity < 0
              AND it.status = 'APPROVED'
        ), 0)
    ) AS calculated_total,
    
    -- Balance delta (total_received - calculated_total)
    -- Formula: total_received should equal in_stock + quarantine + wip + out + withheld
    COALESCE(SUM(b.received_quantity), 0) - (
        COALESCE(SUM(
            CASE 
                WHEN b.status = 'APPROVED' THEN b.remaining_quantity
                ELSE 0
            END
        ), 0) + 
        COALESCE(SUM(
            CASE 
                WHEN b.status IN ('PENDING', 'QUARANTINED') THEN b.remaining_quantity
                ELSE 0
            END
        ), 0) +
        COALESCE((
            SELECT SUM(jcp.quantity)
            FROM job_card_parts jcp
            INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
            INNER JOIN batches b_wip ON jcp.batch_id = b_wip.id
            WHERE b_wip.product_id = p.id
              AND jc.status = 'OPEN'
              AND jcp.batch_id IS NOT NULL
        ), 0) +
        COALESCE((
            SELECT SUM(jcp.quantity)
            FROM job_card_parts jcp
            INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
            INNER JOIN batches b_out ON jcp.batch_id = b_out.id
            WHERE b_out.product_id = p.id
              AND jc.status = 'CLOSED'
              AND jcp.batch_id IS NOT NULL
        ), 0) +
        COALESCE((
            SELECT SUM(ABS(it.quantity))
            FROM inventory_transactions it
            INNER JOIN batches b_wh ON it.batch_id = b_wh.id
            WHERE b_wh.product_id = p.id
              AND it.transaction_type = 'ADJUSTMENT'
              AND it.quantity < 0
              AND it.status = 'APPROVED'
        ), 0)
    ) AS balance_delta

FROM products p
LEFT JOIN batches b ON p.id = b.product_id
WHERE p.is_active = 1
GROUP BY 
    p.id,
    p.part_number,
    p.name,
    p.description,
    p.unit_of_measure;

-- ============================================================================
-- VIEW 2: vw_inventory_list
-- ============================================================================
-- List of all products with their calculated totals and status
-- Used for: Inventory list page, product catalog with stock status
-- ============================================================================

CREATE OR REPLACE VIEW vw_inventory_list AS
SELECT 
    p.id AS product_id,
    p.part_number,
    p.name AS product_name,
    p.description,
    p.unit_of_measure,
    p.is_active,
    
    -- Totals from vw_inventory_part_totals
    COALESCE(totals.total_received, 0) AS total_received,
    COALESCE(totals.in_stock, 0) AS in_stock,
    COALESCE(totals.quarantine, 0) AS quarantine,
    COALESCE(totals.wip, 0) AS wip,
    COALESCE(totals.out, 0) AS out,
    COALESCE(totals.withheld, 0) AS withheld,
    
    -- Status derivation: Active, Inactive, or Quarantine
    CASE 
        WHEN p.is_active = 0 THEN 'Inactive'
        WHEN COALESCE(totals.quarantine, 0) > 0 THEN 'Quarantine'
        ELSE 'Active'
    END AS status,
    
    -- Batch count
    COALESCE((
        SELECT COUNT(*)
        FROM batches b
        WHERE b.product_id = p.id
    ), 0) AS batch_count,
    
    p.created_at,
    p.updated_at

FROM products p
LEFT JOIN vw_inventory_part_totals totals ON p.id = totals.product_id
WHERE p.is_active = 1;

-- ============================================================================
-- VIEW 3: vw_stock_card_batches
-- ============================================================================
-- All batches for a product with full details
-- Used for: Stock card batch listing, batch-level truth
-- ============================================================================

CREATE OR REPLACE VIEW vw_stock_card_batches AS
SELECT 
    b.id AS batch_id,
    b.product_id,
    p.part_number,
    p.name AS product_name,
    b.batch_code,
    b.warehouse_id,
    w.name AS warehouse_name,
    b.location_id,
    b.supplier_id,
    s.name AS supplier_name,
    s.code AS supplier_code,
    b.reference_doc,
    b.received_quantity,
    b.remaining_quantity,
    b.currency,
    b.fx_rate,
    b.landed_cost_per_unit,
    b.fitting_price_per_unit,
    b.status,
    b.expiry_date,
    b.received_by,
    b.approved_by,
    b.received_at,
    b.approved_at,
    b.created_at,
    b.updated_at,
    
    -- Status category for UI grouping
    CASE 
        WHEN b.status = 'APPROVED' THEN 'In Stock'
        WHEN b.status IN ('PENDING', 'QUARANTINED') THEN 'Quarantine'
        WHEN b.status = 'DEPLETED' THEN 'Depleted'
        ELSE 'Unknown'
    END AS status_category,
    
    -- Quantity issued (received - remaining)
    (b.received_quantity - b.remaining_quantity) AS quantity_issued

FROM batches b
INNER JOIN products p ON b.product_id = p.id
LEFT JOIN warehouses w ON b.warehouse_id = w.id
LEFT JOIN suppliers s ON b.supplier_id = s.id
WHERE p.is_active = 1;

-- ============================================================================
-- VIEW 4: vw_stock_card_wip
-- ============================================================================
-- WIP allocations showing parts issued to OPEN jobs
-- Used for: Stock card WIP section, work in progress tracking
-- ============================================================================

CREATE OR REPLACE VIEW vw_stock_card_wip AS
SELECT 
    jcp.id AS job_card_part_id,
    jcp.job_card_id,
    jc.job_number,
    jc.title AS job_title,
    jc.status AS job_status,
    jcp.batch_id,
    b.batch_code,
    b.product_id,
    p.part_number,
    p.name AS product_name,
    jcp.quantity,
    jcp.unit_cost_local,
    jcp.unit_price_local,
    jcp.total_cost_local,
    jcp.total_price_local,
    jcp.source_type,
    jcp.issued_by,
    jcp.received_by,
    jcp.created_at AS issued_at,
    jc.opened_at,
    jc.customer_id,
    c.name AS customer_name,
    jc.aircraft_reg

FROM job_card_parts jcp
INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
INNER JOIN batches b ON jcp.batch_id = b.id
INNER JOIN products p ON b.product_id = p.id
LEFT JOIN customers c ON jc.customer_id = c.id
WHERE jc.status = 'OPEN'
  AND jcp.batch_id IS NOT NULL
  AND p.is_active = 1;

-- ============================================================================
-- VIEW 5: vw_stock_card_movements
-- ============================================================================
-- Transaction movements/audit trail for a product
-- Used for: Stock card movements section, transaction history
-- ============================================================================

CREATE OR REPLACE VIEW vw_stock_card_movements AS
SELECT 
    it.id AS transaction_id,
    it.batch_id,
    b.batch_code,
    b.product_id,
    p.part_number,
    p.name AS product_name,
    it.transaction_type,
    it.direction,
    it.quantity,
    it.unit_cost_local,
    it.total_cost_local,
    it.job_card_part_id,
    jcp.job_card_id,
    jc.job_number,
    jc.title AS job_title,
    it.from_warehouse_id,
    w_from.name AS from_warehouse_name,
    it.to_warehouse_id,
    w_to.name AS to_warehouse_name,
    it.stock_adjustment_reason_id,
    sar.code AS adjustment_reason_code,
    sar.description AS adjustment_reason_description,
    it.created_by,
    it.approved_by,
    it.status AS transaction_status,
    it.notes,
    it.transaction_date,
    it.created_at

FROM inventory_transactions it
INNER JOIN batches b ON it.batch_id = b.id
INNER JOIN products p ON b.product_id = p.id
LEFT JOIN job_card_parts jcp ON it.job_card_part_id = jcp.id
LEFT JOIN job_cards jc ON jcp.job_card_id = jc.id
LEFT JOIN warehouses w_from ON it.from_warehouse_id = w_from.id
LEFT JOIN warehouses w_to ON it.to_warehouse_id = w_to.id
LEFT JOIN stock_adjustment_reasons sar ON it.stock_adjustment_reason_id = sar.id
WHERE p.is_active = 1
ORDER BY it.transaction_date DESC, it.created_at DESC;

