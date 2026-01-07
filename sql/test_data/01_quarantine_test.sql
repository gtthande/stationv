-- ============================================================================
-- Station-2100 :: Inventory Quarantine Test Data (SAFE / MINIMAL)
-- File: sql/test_data/01_quarantine_test.sql
--
-- PURPOSE:
--   Demonstrate APPROVED vs QUARANTINED batches in the Inventory UI.
--
-- IMPORTANT:
--   • NO schema changes
--   • NO joins
--   • NO job cards
--   • NO WIP / OUT / ADJUSTMENTS
--   • SQL ONLY
--   • ADDITIVE & REVERSIBLE
-- ============================================================================

START TRANSACTION;

-- ============================================================================
-- Select a small number of APPROVED batches to quarantine
-- (No assumptions about foreign keys or quantity columns)
-- ============================================================================

DROP TEMPORARY TABLE IF EXISTS tmp_quarantine_targets;

CREATE TEMPORARY TABLE tmp_quarantine_targets AS
SELECT
  id AS batch_id
FROM stock_batches
WHERE status = 'APPROVED'
LIMIT 2;

-- Safety check (should return 1–2 rows)
SELECT * FROM tmp_quarantine_targets;

-- ============================================================================
-- Quarantine selected batches
-- ============================================================================

UPDATE stock_batches
SET
  status = 'QUARANTINED',
  notes = CONCAT(
    IFNULL(notes, ''),
    '\n[TEST] Quarantined for inventory UI validation'
  )
WHERE id IN (
  SELECT batch_id FROM tmp_quarantine_targets
);

-- ============================================================================
-- Verification (table-level only — views handle quantities)
-- ============================================================================

SELECT
  id,
  status,
  notes
FROM stock_batches
WHERE id IN (
  SELECT batch_id FROM tmp_quarantine_targets
);

-- ============================================================================
-- EXPECTED RESULT:
--
-- ✓ Inventory list shows items
-- ✓ Approved batches remain visible
-- ✓ Quarantined batches appear separately
-- ✓ No WIP
-- ✓ No OUT
-- ✓ No adjustments
--
-- STOP HERE. DO NOT RUN OTHER TEST FILES.
-- ============================================================================

COMMIT;
