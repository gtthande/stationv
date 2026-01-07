-- Phase 1: Batch‑only Inventory Views for Station‑2100
-- Drop existing views if rerunning (views only, no data touched)
DROP VIEW IF EXISTS vw_stock_card_batches;
DROP VIEW IF EXISTS vw_inventory_list;

-- View 1: vw_inventory_list
-- One row per part, summarising totals from all batches.
CREATE VIEW vw_inventory_list AS
SELECT
  p.id            AS product_id,
  CAST(p.part_no AS CHAR) AS part_number,
  p.description   AS product_name,
  p.description   AS description,
  p.unit_of_measure AS unit_of_measure,
  COALESCE(SUM(b.quantity), 0) AS total_received,
  COALESCE(SUM(CASE WHEN b.status = 'APPROVED' THEN b.quantity_remaining ELSE 0 END), 0) AS in_stock,
  COALESCE(SUM(CASE WHEN b.status IN ('QUARANTINED','PENDING') THEN b.quantity_remaining ELSE 0 END), 0) AS quarantine,
  0 AS wip,
  0 AS out_qty,
  0 AS withheld,
  CASE
    WHEN SUM(CASE WHEN b.status = 'APPROVED' THEN b.quantity_remaining ELSE 0 END) > 0 THEN 'IN STOCK'
    WHEN SUM(CASE WHEN b.status IN ('QUARANTINED','PENDING') THEN b.quantity_remaining ELSE 0 END) > 0 THEN 'QUARANTINE'
    WHEN SUM(b.quantity) > 0 THEN 'DEPLETED'
    ELSE 'NO STOCK'
  END AS status,
  COUNT(b.id) AS batch_count,
  p.created_at,
  p.updated_at
FROM stock_parts p
LEFT JOIN stock_batches b ON b.part_no = p.part_no
WHERE p.is_active = 1
GROUP BY
  p.id, p.part_no, p.description, p.unit_of_measure, p.created_at, p.updated_at;

-- View 2: vw_stock_card_batches
-- All batches for a part with supplier and warehouse details.
CREATE VIEW vw_stock_card_batches AS
SELECT
  b.id             AS batch_id,
  CAST(b.part_no AS CHAR) AS part_number,
  p.id             AS product_id,
  p.description    AS product_name,
  b.batch_no       AS batch_no,
  b.quantity       AS quantity_received,
  b.quantity_remaining AS quantity_remaining,
  b.status         AS status,
  b.batch_date     AS received_date,
  b.expiry_date    AS expiry_date,
  b.reference_no   AS reference_doc,
  NULL             AS currency,
  NULL             AS fx_rate,
  NULL             AS landed_cost_per_unit,
  NULL             AS fitting_price_per_unit,
  b.supplier_id    AS supplier_id,
  s.name           AS supplier_name,
  s.code           AS supplier_code,
  b.warehouse_id   AS warehouse_id,
  w.name           AS warehouse_name,
  NULL             AS location_id,
  b.notes          AS notes,
  b.created_at,
  b.updated_at,
  CASE
    WHEN b.status = 'APPROVED' THEN 'APPROVED'
    WHEN b.status = 'QUARANTINED' THEN 'QUARANTINED'
    WHEN b.status = 'PENDING' THEN 'PENDING'
    WHEN b.status = 'DEPLETED' THEN 'DEPLETED'
    ELSE 'UNKNOWN'
  END AS status_category,
  0 AS quantity_issued
FROM stock_batches b
LEFT JOIN stock_parts p ON p.part_no = b.part_no
LEFT JOIN suppliers s ON s.id = b.supplier_id
LEFT JOIN warehouses w ON w.id = b.warehouse_id;
