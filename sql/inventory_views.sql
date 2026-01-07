/* ============================================================================
   Station-2100 :: Inventory Views (MySQL/MariaDB) — Database-first
   Target DB: stationv_clean

   IMPORTANT:
   - This schema uses: stock_parts, stock_batches, suppliers, warehouses
   - This script creates 5 READ-ONLY VIEWS used by the Inventory UI/API.
   - WIP + Movements views are created as EMPTY placeholders for now
     (because job_cards / inventory_transactions tables are not present yet).
   ============================================================================ */

-- Safety: drop views if re-running (views only, no data touched)
DROP VIEW IF EXISTS vw_stock_card_movements;
DROP VIEW IF EXISTS vw_stock_card_wip;
DROP VIEW IF EXISTS vw_stock_card_batches;
DROP VIEW IF EXISTS vw_inventory_list;
DROP VIEW IF EXISTS vw_inventory_part_totals;

-- ============================================================================
-- VIEW 1: vw_inventory_part_totals
-- Aggregated totals per part (based on stock_parts + stock_batches)
-- ============================================================================
CREATE VIEW vw_inventory_part_totals AS
SELECT
  p.id              AS part_id,
  p.part_no         AS part_no,

  /* Totals derived from batches */
  COALESCE(SUM(b.quantity), 0) AS qty_received_total,

  COALESCE(SUM(
    CASE WHEN b.status = 'APPROVED' THEN b.quantity_remaining ELSE 0 END
  ), 0) AS qty_in_stock,

  COALESCE(SUM(
    CASE WHEN b.status IN ('PENDING', 'QUARANTINED') THEN b.quantity_remaining ELSE 0 END
  ), 0) AS qty_quarantine,

  COUNT(b.id) AS batch_count

FROM stock_parts p
LEFT JOIN stock_batches b
  ON b.part_no = p.part_no
GROUP BY
  p.id, p.part_no;

-- ============================================================================
-- VIEW 2: vw_inventory_list
-- Inventory list page source.
-- Keep it simple + reliable:
-- - part name is part_no (until you add a dedicated name column)
-- - status derived from totals
-- ============================================================================
CREATE VIEW vw_inventory_list AS
SELECT
  t.part_id      AS part_id,
  t.part_no      AS part_no,
  t.part_no      AS part_name,

  t.qty_received_total,
  t.qty_in_stock,
  t.qty_quarantine,
  t.batch_count,

  CASE
    WHEN t.qty_in_stock > 0 THEN 'IN STOCK'
    WHEN t.qty_quarantine > 0 THEN 'QUARANTINE'
    WHEN t.qty_received_total > 0 THEN 'DEPLETED'
    ELSE 'NO STOCK'
  END AS status

FROM vw_inventory_part_totals t;

-- ============================================================================
-- VIEW 3: vw_stock_card_batches
-- Detail page batches table source.
-- Includes supplier + warehouse names if available.
-- ============================================================================
CREATE VIEW vw_stock_card_batches AS
SELECT
  b.id                 AS batch_id,
  b.part_no            AS part_no,
  b.batch_no           AS batch_no,

  s.name               AS supplier_name,
  b.batch_date         AS received_date,
  b.expiry_date        AS expiry_date,

  b.quantity           AS qty_received,
  b.quantity_remaining AS qty_remaining,

  b.status             AS status,
  w.name               AS warehouse_name,

  b.notes              AS notes,
  b.reference_no       AS reference_no

FROM stock_batches b
LEFT JOIN suppliers  s ON s.id = b.supplier_id
LEFT JOIN warehouses w ON w.id = b.warehouse_id;

-- ============================================================================
-- VIEW 4: vw_stock_card_wip
-- Placeholder (empty) — UI should hide WIP section when no rows.
-- ============================================================================
CREATE VIEW vw_stock_card_wip AS
SELECT
  NULL AS part_no,
  NULL AS job_card_no,
  NULL AS aircraft_reg,
  NULL AS batch_no,
  NULL AS qty,
  NULL AS issued_by,
  NULL AS issued_at
WHERE 1 = 0;

-- ============================================================================
-- VIEW 5: vw_stock_card_movements
-- Placeholder (empty) — UI should hide/empty movements section when no rows.
-- ============================================================================
CREATE VIEW vw_stock_card_movements AS
SELECT
  NULL AS part_no,
  NULL AS movement_date,
  NULL AS movement_type,
  NULL AS ref,
  NULL AS batch_no,
  NULL AS qty
WHERE 1 = 0;

-- ============================================================================
-- Quick sanity checks (should NOT error)
-- ============================================================================
SELECT COUNT(*) AS inventory_rows FROM vw_inventory_list;
SELECT COUNT(*) AS batch_rows FROM vw_stock_card_batches;
