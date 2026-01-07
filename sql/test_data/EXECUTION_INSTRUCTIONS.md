# Test Data Execution Instructions

## Quick Execution (Recommended)

If you have MySQL command line client installed, execute the SQL files directly:

```bash
# From project root, with your MySQL credentials:
mysql -u root -p stationv < sql/test_data/01_quarantine_test.sql
mysql -u root -p stationv < sql/test_data/02_wip_test.sql
mysql -u root -p stationv < sql/test_data/03_out_test.sql
mysql -u root -p stationv < sql/test_data/04_withheld_test.sql
mysql -u root -p stationv < sql/test_data/05_validation.sql
```

Or execute all at once:

```bash
mysql -u root -p stationv < sql/test_data/01_quarantine_test.sql && \
mysql -u root -p stationv < sql/test_data/02_wip_test.sql && \
mysql -u root -p stationv < sql/test_data/03_out_test.sql && \
mysql -u root -p stationv < sql/test_data/04_withheld_test.sql && \
mysql -u root -p stationv < sql/test_data/05_validation.sql
```

## Alternative: Using Node.js Script

If you prefer using the Node.js execution script:

1. Ensure `.env` file exists with `DATABASE_URL`:
   ```env
   DATABASE_URL="mysql://root:yourpassword@localhost:3306/stationv"
   ```

2. Run the execution script:
   ```bash
   npx tsx execute_test_data.ts
   ```

## Execution Order (MANDATORY)

1. `01_quarantine_test.sql` - Creates quarantine state
2. `02_wip_test.sql` - Creates WIP state  
3. `03_out_test.sql` - Creates OUT state
4. `04_withheld_test.sql` - Creates WITHHELD state
5. `05_validation.sql` - Validates all test data

## Expected Results

After execution, you should see:
- ✅ All inventory states populated (In Stock, Quarantine, WIP, Out, Withheld)
- ✅ No negative stock
- ✅ FIFO preserved
- ✅ Reconciliation balances correctly
- ✅ Test data clearly marked with "TEST" prefix

## Verification

Check the Inventory UI to verify:
- Inventory list shows non-zero values in all states
- Stock cards show correct batch breakdowns
- WIP allocations visible
- Transaction ledger shows RECEIPT, ISSUE, ADJUSTMENT types

