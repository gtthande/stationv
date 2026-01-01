# STATION-2100 — COMPLETE TECHNICAL SPECIFICATION
## Aviation Maintenance & Inventory Management System

*Developer Documentation - Version 2.1*

---

## Table of Contents

1. [Core Identity & System Scope](#1-core-identity)
2. [System Architecture](#2-system-architecture)
3. [Database Architecture (Master-Detail)](#3-database-architecture)
4. [Module 1 - Inventory Management (Batch-Based)](#4-inventory-management)
5. [Module 2 - Job Cards / Work Orders](#5-job-cards)
6. [Module 3 - Rotables (Serialized Components)](#6-rotables)
7. [Module 4 - Tools Tracking](#7-tools)
8. [Module 5 - Suppliers & Customers](#8-suppliers-customers)
9. [Module 6 - User Management & Permissions](#9-permissions)
10. [Module 7 - Reporting & Analytics](#10-reporting)
11. [Module 8 - Admin / Settings](#11-admin)
12. [Module 9 - Future Integrations](#12-integrations)
13. [Data Flow & System Behaviour](#13-data-flow)
14. [Quick Reference](#14-quick-reference)
15. [Appendix A - Complete Permission Reference](#appendix-a)

---

<a name="1-core-identity"></a>
## 1. Core Identity & System Scope

### 1.1 What is Station-2100?

Station-2100 is a **transaction-driven, permission-controlled aviation maintenance system** composed of **nine integrated modules**.

It manages everything through:
- **Master-Detail Batches** (inventory tracking with product catalog)
- **Granular permissions** (user access control)
- **Approvals** (authorization workflows)
- **Full audit trails** (compliance & traceability)
- **Historical reconstruction** (time-travel queries)

**Core Principle:** No stock value or job value is ever manually typed—**everything comes from controlled transactions**.

### 1.2 System Scope (Complete Feature Set)

**✅ All Features Preserved and Carried Forward:**

#### **Inventory System (Master-Detail Architecture)**
- ✓ **Product master catalog** - One record per part number
- ✓ **Batch-based inventory** - All stock tracked by supplier batches
- ✓ **Historical stock reconstruction** - Calculate inventory at any past date
- ✓ **Exchange rate override** - System-suggested rates, user overrides allowed
- ✓ **Landed cost vs fitting price** - Separate purchase cost and selling price
- ✓ **On-hold / quarantined stock** - Temporary restrictions
- ✓ **WIP stock visibility** - Track reserved stock in open jobs
- ✓ **Fractional quantities** - Support 0.5L, 0.75kg, etc. (DECIMAL precision)
- ✓ **Multiple warehouses** - Independent warehouse management
- ✓ **Barcode / QR scanning** - Generate and scan barcodes
- ✓ **Complete transaction log** - Every movement recorded

#### **Job Card System**
- ✓ **4-tab job cards** - Main, Consumables, Owner-supplied, Labour
- ✓ **Issued by / received by tracking** - Full traceability on parts
- ✓ **Owner-supplied items** - Zero-cost FOC parts
- ✓ **Labour tracking** - Hours, rates, totals
- ✓ **Job closure workflow** - Permission-based closure
- ✓ **Invoice number field** - Editable by authorized users

#### **Permission & Security**
- ✓ **Granular permission-based control** - Not fixed roles
- ✓ **Approval workflows** - Configurable multi-level approvals
- ✓ **Self-approval capability** - Users can approve own actions if authorized
- ✓ **Audit trails** - Complete action logging

#### **Components & Tools**
- ✓ **Rotables tracking** - Serialized component lifecycle
- ✓ **Tools management** - Issue/return with calibration
- ✓ **Service interval tracking** - Overdue component alerts

#### **Integrations**
- ✓ **Future QuickBooks integration** - Invoicing and purchasing sync
- ✓ **Supplier/customer management** - Master data

#### **Reporting**
- ✓ **Historical reports** - Stock as of any date
- ✓ **Movement reports** - Date range analysis
- ✓ **Financial visibility** - Cost/profit analysis
- ✓ **Analytics dashboards** - Charts and graphs

---

<a name="2-system-architecture"></a>
## 2. System Architecture Overview

### 2.1 Architecture Diagram

```
═══════════════════════════════════════════════════════════════
                    SYSTEM ARCHITECTURE
═══════════════════════════════════════════════════════════════

                    ┌─────────────────────┐
                    │ USER MANAGEMENT &   │
                    │    PERMISSIONS      │
                    │  (Granular Access)  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
    ┌─────────────┐   ┌────────────┐   ┌─────────────┐
    │  INVENTORY  │ ↔ │ APPROVALS  │ ↔ │    ADMIN    │
    │  (Master-   │   │   ENGINE   │   │  (Settings) │
    │   Detail)   │   │            │   │             │
    └──────┬──────┘   └─────┬──────┘   └──────┬──────┘
           │                │                  │
           └────────────────┴──────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
    ┌─────────────┐   ┌──────────┐   ┌──────────┐
    │  JOB CARDS  │   │ ROTABLES │   │  TOOLS   │
    │  (4 Tabs)   │   │(Lifecycle)│   │ (Issue/  │
    │             │   │          │   │  Return) │
    └──────┬──────┘   └────┬─────┘   └────┬─────┘
           │               │              │
           └───────────────┴──────────────┘
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
    ┌─────────────┐  ┌──────────┐  ┌──────────┐
    │ SUPPLIERS & │  │ REPORTS &│  │  FUTURE  │
    │  CUSTOMERS  │  │ ANALYTICS│  │QUICKBOOKS│
    └─────────────┘  └──────────┘  └──────────┘

═══════════════════════════════════════════════════════════════
```

### 2.2 Module Overview

| # | Module | Core Function | Key Features |
|---|--------|---------------|--------------|
| 1 | **Inventory** | Master-detail batch tracking | Product catalog + batch receipts |
| 2 | **Job Cards** | Work orders with 4 tabs | Labour, parts (3 types), WIP tracking |
| 3 | **Rotables** | Serialized component lifecycle | Service intervals, TSO, cost history |
| 4 | **Tools** | Portable tool tracking | Issue/return, calibration, missing alerts |
| 5 | **Suppliers/Customers** | Master data | Links to inventory & jobs |
| 6 | **User Management** | Permission control | Granular permissions, audit logs |
| 7 | **Reports** | Analytics & insights | Historical, financial, operational |
| 8 | **Admin** | System configuration | Settings, warehouses, permissions |
| 9 | **Integrations** | External systems | QuickBooks (future), APIs |

---

<a name="3-database-architecture"></a>
## 3. Database Architecture (Master-Detail)

### 🔥 CRITICAL: Master-Detail Relationship

Station-2100 inventory uses a **master-detail (header-detail)** architecture:

- **MASTER** (`inventory_products`) = Product catalog/master data
- **DETAIL** (`inventory_batches`) = Individual batch receipts with quantities
- **LOG** (`inventory_transactions`) = Complete audit trail

```
┌──────────────────────────┐
│  INVENTORY_PRODUCTS      │ ← MASTER (One record per part)
│  (Product Catalog)       │
├──────────────────────────┤
│  • id (product_id)       │
│  • part_number  (UNIQUE) │
│  • description           │
│  • unit_of_measure       │
│  • unit_cost (average)   │
│  • sale_price            │
│  • bin_no (default)      │
│  • rack (default)        │
│  • row_position          │
│  • minimum_stock         │
│  • reorder_point         │
│  • superseding_no        │
│  • alternate_part_no     │
│  • active                │
└───────────┬──────────────┘
            │
            │ ONE-TO-MANY
            │ (One product → Many batches)
            ▼
┌──────────────────────────┐
│  INVENTORY_BATCHES       │ ← DETAIL (Multiple per product)
│  (Batch Tracking)        │
├──────────────────────────┤
│  • id (batch_id)         │
│  • product_id (FK)       │◄─── Links to master
│  • batch_number (UNIQUE) │
│  • quantity (remaining)  │     ← CHANGES with issues/returns
│  • quantity_received     │     ← NEVER CHANGES
│  • supplier_id           │
│  • supplier_invoice_no   │
│  • foreign_currency      │
│  • foreign_cost          │
│  • exchange_rate         │     ← USER OVERRIDEABLE
│  • landed_cost           │
│  • unit_cost (batch)     │
│  • selling_price         │     ← USER OVERRIDEABLE
│  • bin_no (override)     │
│  • rack (override)       │
│  • row_position          │
│  • status                │     ← PENDING/APPROVED/QUARANTINED/DEPLETED
│  • received_by           │
│  • approved_by           │
│  • aircraft_reg_no       │
│  • core_value            │
│  • serial_no             │
└──────────┬───────────────┘
           │
           │ LOGGED IN
           ▼
┌──────────────────────────┐
│  INVENTORY_TRANSACTIONS  │ ← TRANSACTION LOG (All movements)
│  (Complete Audit Trail)  │
├──────────────────────────┤
│  • id                    │
│  • transaction_no        │
│  • product_id (FK)       │
│  • batch_id (FK)         │
│  • transaction_type      │     ← RECEIPT/ISSUE/ADJUSTMENT/RETURN
│  • quantity              │     ← Signed: + or -
│  • unit_cost             │
│  • total_value           │
│  • reference_type        │     ← JOB_CARD/DIRECT_ISSUE/STOCKTAKE
│  • reference_id          │
│  • issued_by             │
│  • received_by           │
│  • transaction_date      │
│  • status                │     ← PENDING/APPROVED
└──────────────────────────┘
```

### 3.1 Master Table: INVENTORY_PRODUCTS

**Purpose:** Product catalog - ONE record per unique part

```sql
CREATE TABLE inventory_products (
  -- Primary Key
  id                    CHAR(36) PRIMARY KEY,
  
  -- Product Identity
  part_number           VARCHAR(100) NOT NULL UNIQUE,
  description           TEXT,
  unit_of_measure       VARCHAR(50),              -- L, kg, EA, m
  
  -- Pricing (Calculated/Default)
  unit_cost             DECIMAL(10,4) DEFAULT 0,  -- Weighted avg from batches
  sale_price            DECIMAL(10,4),            -- Default selling price
  purchase_price        DECIMAL(10,4),            -- Last purchase price
  sale_markup           DECIMAL(10,2),            -- Default markup %
  
  -- Stock Management
  minimum_stock         DECIMAL(10,4),            -- Min level alert
  reorder_point         DECIMAL(10,4),            -- Reorder trigger
  reorder_qty           DECIMAL(10,4),            -- Suggested reorder qty
  open_balance          DECIMAL(10,4),            -- Opening balance
  open_bal_date         DATE,                     -- Opening balance date
  
  -- Classification
  stock_category        VARCHAR(100),
  department_id         CHAR(36),
  
  -- Default Location (can override per batch)
  bin_no                VARCHAR(50),
  rack                  VARCHAR(50),
  row_position          VARCHAR(50),
  
  -- Alternative Parts
  superseding_no        VARCHAR(100),             -- Superseding part
  alternate_part_no     VARCHAR(100),             -- Alternative part
  
  -- Status
  active                TINYINT(1) DEFAULT 1,
  
  -- Audit
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by            CHAR(36),
  
  -- Foreign Keys
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  
  -- Indexes
  INDEX idx_part_number (part_number),
  INDEX idx_department (department_id),
  INDEX idx_active (active)
);
```

**Key Points:**
- ✅ ONE record per part number
- ✅ Used for stock cards and product catalog
- ✅ Stock quantities NOT stored here (calculated from batches)
- ✅ Never deleted, only marked inactive

### 3.2 Detail Table: INVENTORY_BATCHES

**Purpose:** Individual receipts - MULTIPLE records per product

```sql
CREATE TABLE inventory_batches (
  -- Primary Key
  id                    CHAR(36) PRIMARY KEY,
  
  -- Link to Master
  product_id            CHAR(36) NOT NULL,
  
  -- Batch Identity
  batch_number          VARCHAR(100) NOT NULL UNIQUE,
  
  -- Quantities (DECIMAL for fractional support)
  quantity              DECIMAL(10,4) NOT NULL,   -- Current remaining
  quantity_received     DECIMAL(10,4) NOT NULL,   -- Original received
  
  -- Supplier Information
  supplier_id           CHAR(36),
  supplier_invoice_no   VARCHAR(255),
  purchase_order        VARCHAR(255),
  reference_no          VARCHAR(255),
  
  -- Dates
  received_date         DATETIME NOT NULL,
  expiry_date           DATE,
  
  -- Foreign Currency Costing
  foreign_currency      VARCHAR(3),               -- USD, EUR, GBP
  foreign_cost          DECIMAL(15,2),
  exchange_rate         DECIMAL(10,4),            -- USER OVERRIDEABLE
  
  -- Local Currency Costing
  landed_cost           DECIMAL(15,2),
  unit_cost             DECIMAL(10,4),
  freight_cost          DECIMAL(15,2),
  
  -- Pricing
  selling_price         DECIMAL(10,4),            -- USER OVERRIDEABLE
  sale_markup_percent   DECIMAL(10,2),
  
  -- Location (overrides product defaults)
  warehouse_id          CHAR(36),
  bin_no                VARCHAR(50),
  rack                  VARCHAR(50),
  row_position          VARCHAR(50),
  
  -- Status
  status                VARCHAR(50) DEFAULT 'PENDING',
  
  -- Audit Trail
  received_by           CHAR(36),
  approved_by           CHAR(36),
  approved_at           DATETIME,
  
  -- Additional Fields
  aircraft_reg_no       VARCHAR(50),
  core_value            DECIMAL(15,2),
  serial_no             VARCHAR(255),
  notes                 TEXT,
  
  -- Media (URLs only)
  technical_image_url   TEXT,
  appearance_image_url  TEXT,
  
  -- Timestamps
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (product_id) REFERENCES inventory_products(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  FOREIGN KEY (received_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  -- Indexes
  INDEX idx_product (product_id),
  INDEX idx_batch_number (batch_number),
  INDEX idx_status (status),
  INDEX idx_received_date (received_date)
);
```

**Status Values:**
- `PENDING` - Awaiting approval
- `APPROVED` - Ready for use
- `QUARANTINED` - On hold
- `DEPLETED` - Fully consumed (quantity = 0)

### 3.3 Transaction Log: INVENTORY_TRANSACTIONS

**Purpose:** Complete audit trail - EVERY movement logged

```sql
CREATE TABLE inventory_transactions (
  -- Primary Key
  id                    CHAR(36) PRIMARY KEY,
  
  -- Transaction Identity
  transaction_no        VARCHAR(100) NOT NULL UNIQUE,
  
  -- Links
  product_id            CHAR(36) NOT NULL,
  batch_id              CHAR(36) NOT NULL,
  
  -- Transaction Details
  transaction_type      VARCHAR(50) NOT NULL,     -- RECEIPT/ISSUE/ADJUSTMENT/RETURN
  quantity              DECIMAL(10,4) NOT NULL,   -- Signed: + or -
  unit_cost             DECIMAL(10,4) NOT NULL,
  total_value           DECIMAL(15,2) NOT NULL,
  
  -- Reference
  reference_type        VARCHAR(50),              -- JOB_CARD/DIRECT_ISSUE/STOCKTAKE
  reference_id          CHAR(36),
  
  -- Users
  issued_by             CHAR(36),
  received_by           CHAR(36),
  created_by            CHAR(36),
  approved_by           CHAR(36),
  
  -- Dates
  transaction_date      DATETIME NOT NULL,
  approved_at           DATETIME,
  
  -- Status
  status                VARCHAR(50) DEFAULT 'PENDING',
  
  -- Additional
  notes                 TEXT,
  
  -- Timestamps
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (product_id) REFERENCES inventory_products(id),
  FOREIGN KEY (batch_id) REFERENCES inventory_batches(id),
  FOREIGN KEY (issued_by) REFERENCES users(id),
  FOREIGN KEY (received_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  -- Indexes
  INDEX idx_product (product_id),
  INDEX idx_batch (batch_id),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_status (status)
);
```

**Transaction Types:**
| Type | Quantity | Effect | Example |
|------|----------|--------|---------|
| **RECEIPT** | + (positive) | Creates/increases batch | Receiving from supplier |
| **ISSUE** | - (negative) | Reduces batch | Issue to job card |
| **ADJUSTMENT** | +/- | Adjusts batch | Stocktake correction |
| **RETURN** | + (positive) | Increases batch | Return from job |

---

<a name="4-inventory-management"></a>
## 4. Module 1 – Inventory Management (Batch-Based)

### 🔥 INVENTORY IS THE CENTRAL ENGINE OF STATION-2100

All inventory in Station-2100 uses a **master-detail batch architecture**:
- **Master** = Product catalog (one record per part)
- **Detail** = Batch receipts (many per product)

This is not optional—it's fundamental to how the system works.

### 4.1 Batch Flow (Complete Lifecycle)

**CRITICAL WORKFLOW - HOW BATCHES WORK:**

```
═══════════════════════════════════════════════════════════════
                    BATCH LIFECYCLE FLOW
═══════════════════════════════════════════════════════════════

STEP 1: RECEIVE
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Item arrives from supplier                            ┃
┃ • User scans/enters details                             ┃
┃ • System generates batch number (e.g., B-2025-0001)     ┃
┃ • Status: PENDING                                        ┃
┃ • Available for use: NO                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           ↓

STEP 2: PENDING APPROVAL  
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Batch awaits authorization                            ┃
┃ • Visible to users with 'inventory.approve_receipt'     ┃
┃ • Cannot be issued to jobs yet                          ┃
┃ • Can be edited or deleted                              ┃
┃ • User with approval permission can self-approve        ┃
┃ • Status: PENDING                                        ┃
┃ • Available for use: NO                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           ↓

STEP 3: APPROVED
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Authorized user approves the batch                    ┃
┃ • Status changes to: APPROVED                            ┃
┃ • Stock NOW becomes available for use                   ┃
┃ • Can now be issued to jobs                             ┃
┃ • Approval is permanent (cannot un-approve)             ┃
┃ • Available for use: YES                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           ↓

STEP 4: LIVE STOCK (In Active Use)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Stock is available for issuing                        ┃
┃ • Issues REDUCE 'quantity_remaining'                    ┃
┃ • Returns INCREASE 'quantity_remaining'                 ┃
┃ • All movements tracked as transactions                 ┃
┃ • Can be quarantined if needed                          ┃
┃ • Status: APPROVED                                       ┃
┃ • Available for use: YES                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           ↓

STEP 5: DEPLETED (Fully Consumed)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • 'quantity_remaining' reaches 0                        ┃
┃ • Status: DEPLETED                                       ┃
┃ • Archived but RETAINED FOREVER for historical queries  ┃
┃ • Available for use: NO (nothing left)                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

═══════════════════════════════════════════════════════════════
```

**Process Steps Explained:**

### 3.5 Special Batch States (IMPORTANT)

**Batches can be in different states that affect availability:**

| State | Description | Available for Issue? | Use Case |
|-------|-------------|---------------------|----------|
| **PENDING** | Awaiting approval | ❌ NO | Just received, not yet authorized |
| **APPROVED** | Ready for use | ✅ YES | Normal available stock |
| **QUARANTINED** | On hold / Quality issue | ❌ NO | Suspected defect, awaiting inspection |
| **IN_JOB (WIP)** | Reserved for open job | ⚠️ RESERVED | Parts issued to job card not yet closed |
| **DEPLETED** | Fully consumed | ❌ NO | Historical record only |

**Special State Details:**

**ON HOLD / QUARANTINE:**
- Temporarily make stock unavailable
- Used for quality holds, inspections, disputes
- Can be released back to APPROVED status
- All movements still tracked

**IN JOB (WIP):**
- Stock issued to open job cards
- Reserved but not yet consumed
- Reduces available stock
- Returns to general stock if job cancelled or parts returned
- Visible in "WIP Stock" reports

### 3.6 Barcode / QR Code Support (Flexible System)

**The system supports flexible barcode workflows:**

✅ **Items can arrive WITHOUT barcodes** (manual entry supported)  
✅ **System can GENERATE barcodes/QR codes** for internal use  
✅ **Batch-level scanning** (not just product-level)  
✅ **Job scanning uses BATCH SCANNING** like a point-of-sale system

**Barcode Workflow:**

```
═══════════════════════════════════════════════════════════════
         OPTION A: Items Arrive WITH Barcodes
═══════════════════════════════════════════════════════════════

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Scan supplier│  →   │ Create batch │  →   │ Store barcode│
│   barcode    │      │  in system   │      │  reference   │
└──────────────┘      └──────────────┘      └──────────────┘


═══════════════════════════════════════════════════════════════
        OPTION B: Items Arrive WITHOUT Barcodes
═══════════════════════════════════════════════════════════════

┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Manual entry │ → │ Create batch │ → │ Generate QR  │ → │ Print & attach│
│  of details  │   │  in system   │   │     code     │   │   label/tag  │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘


═══════════════════════════════════════════════════════════════
       Issuing to Job Cards (Point-of-Sale Style)
═══════════════════════════════════════════════════════════════

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Scan batch   │  →   │ Select/enter │  →   │ Assign to    │
│  QR code     │      │  quantity    │      │  job card    │
└──────────────┘      └──────────────┘      └──────────────┘

═══════════════════════════════════════════════════════════════
```

**Benefits:**
- Flexible: Works with or without supplier barcodes
- Fast: POS-style scanning for job parts
- Traceable: Batch-level scanning ensures exact traceability
- Printable: Generate labels on-demand

### 3.7 Fractional Quantities Support (ALL WAREHOUSES)

**CRITICAL: ALL WAREHOUSES SUPPORT FRACTIONAL QUANTITIES**

This is NOT limited to "consumables warehouses"—**ANY warehouse** can handle fractional amounts.

**Why This Matters:**
- Consumables (paint, oil, chemicals) are measured in liters, kilograms
- Users need to issue partial quantities (0.5 L, 0.75 kg, etc.)
- System must track fractional stock accurately

**Real-World Examples:**

```
Example 1: Paint
Product: Aircraft Paint (Gloss White)
Unit: Liters (L)

Batch Received:    25.00 L
Issue 1:          -10.50 L (to Job JC-2025-001) ← Fractional
Issue 2:           -3.75 L (to Job JC-2025-002) ← Fractional
Issue 3:           -8.25 L (to Job JC-2025-003) ← Fractional
Remaining:          2.50 L ← Fractional

Example 2: Hydraulic Fluid
Product: AeroShell Fluid 41
Unit: Liters (L)

Batch Received:   100.00 L
Issue 1:          -12.25 L
Issue 2:           -5.50 L
Issue 3:          -18.75 L
Adjustment:        -0.50 L (spillage)
Remaining:         63.00 L

Example 3: Sealant
Product: PR-1776 Sealant
Unit: Kilograms (kg)

Batch Received:     5.00 kg
Issue 1:           -0.75 kg ← Very small fractional
Issue 2:           -1.25 kg
Issue 3:           -0.50 kg
Remaining:          2.50 kg
```

**Technical Implementation:**
- Database: MySQL `DECIMAL(10, 4)` for ALL quantity fields
- Precision: Supports up to 4 decimal places (0.0001)
- Example: Can track 0.0001 liters if needed
- Calculations: All math uses decimal precision (no rounding errors)

**Warehouse Configuration:**
- Main Warehouse: ✓ Supports fractional quantities
- Consumables Warehouse: ✓ Supports fractional quantities  
- Owner-Supplied Warehouse: ✓ Supports fractional quantities
- **ALL warehouses:** ✓ Supports fractional quantities

### 3.8 Historical Stock Reconstruction (POWERFUL FEATURE)

**UNIQUE CAPABILITY: Calculate stock as at ANY PAST DATE**

This is one of the most powerful features of the batch-based system.

**The Formula:**

```
Stock at Specific Date = Opening Balance
                       + Approved Receipts (≤ date)
                       - Approved Issues (≤ date)
                       ± Approved Adjustments (≤ date)
```

**How It Works:**

```
Query: "What was the stock of Hydraulic Fluid AeroShell 41 
        in Main Warehouse on January 15, 2025?"

Step 1: Get all APPROVED batches of this product received on or before Jan 15, 2025
Step 2: Get all APPROVED transactions affecting these batches on or before Jan 15, 2025
Step 3: Replay transactions chronologically:
   - RECEIPT transactions: Add quantity & value
   - ISSUE transactions: Subtract quantity & value
   - ADJUSTMENT transactions: Add or subtract per adjustment amount
Step 4: Calculate final totals

Result:
  Quantity on Hand: 157.50 L
  Total Value: 104,362.50 KES
  Average Unit Cost: 662.50 KES/L
  Active Batches: 3 batches still had stock on that date
  
Breakdown by Batch:
  Batch B-2024-0145: 50.00 L @ 650.00 KES/L
  Batch B-2025-0003: 75.50 L @ 670.00 KES/L
  Batch B-2025-0012: 32.00 L @ 665.00 KES/L
```

**Real-World Use Cases:**

| Scenario | How Historical Reconstruction Helps |
|----------|-------------------------------------|
| **Audit Compliance** | "Show me exact stock on Dec 31 for year-end audit" |
| **Financial Reconciliation** | "Verify stock value matches accounting on quarter-end" |
| **Dispute Resolution** | "Customer claims we were out of stock on June 15—prove it" |
| **Performance Analysis** | "Compare stock levels monthly over past year" |
| **Trend Analysis** | "Show stock turnover rate for last 6 months" |
| **Inventory Accuracy** | "Was the stocktake on March 31 accurate?" |

**Why This Works:**
- All transactions are IMMUTABLE (never edited or deleted)
- Every transaction has a timestamp
- Batch system tracks exact source of every item
- Approval system ensures only valid transactions count
- System "replays history" to reconstruct any past state

**Example Audit Query:**

```
"Our auditor needs to verify stock value on December 31, 2024"

System Process:
1. Query all batches for all products in all warehouses
2. Filter transactions ≤ 2024-12-31 23:59:59
3. Replay chronologically:
   - Jan 5: Received 100 units @ 500 KES = +50,000 KES
   - Jan 12: Issued 30 units @ 500 KES = -15,000 KES
   - ... (all transactions for the year)
4. Generate report:
   
   Total Stock Value as of Dec 31, 2024: 2,450,000 KES
   Total Quantity: 4,850 units
   Number of Products: 127
   Number of Batches: 345
   
   [Full breakdown by product/batch available]
```

### 3.9 Exchange Rate & Pricing (USER OVERRIDE CAPABILITY)

**IMPORTANT: System suggests, user can override**

**Exchange Rates:**

✓ **System provides SUGGESTED rate** from admin settings  
✓ **User can OVERRIDE at time of batch creation**  
✓ **Rate is LOCKED after batch approval** (for consistency)

**Why Override Capability Matters:**
- Exchange rates fluctuate daily
- Supplier invoice may have different rate
- Bank may use different conversion rate
- User needs final say on actual rate used

**Pricing Structure Example:**

```
Batch Receipt Form:

Foreign Currency: USD
Foreign Cost: $500.00
Exchange Rate: 132.50 KES/USD  [System Suggested] [Override ✏️]
                                 ↑
                        User can click to override

If user overrides to 135.00:
─────────────────────────────────────
Foreign Cost:       $500.00 USD
Exchange Rate:      1 USD = 135.00 KES  ← User override accepted
─────────────────────────────────────
Landed Cost:        67,500.00 KES (instead of 66,250.00)

Unit Cost:          675.00 KES/L (calculated: 67,500 / 100)
Selling Price:      810.00 KES/L (system suggests 20% markup)
                    ↑
               [Override ✏️] ← User can also override selling price
Fitting Price:      750.00 KES/L (alternative pricing)
```

**Complete Pricing Fields:**

| Field | Source | Override? | Purpose |
|-------|--------|-----------|---------|
| **Foreign Cost** | User enters | - | Original supplier price |
| **Foreign Currency** | User selects | - | USD, EUR, GBP, etc. |
| **Exchange Rate** | System suggests | ✅ YES | Conversion rate |
| **Landed Cost** | Calculated | - | Foreign cost × rate |
| **Unit Cost** | Calculated | - | Landed cost ÷ quantity |
| **Selling Price** | System suggests (markup) | ✅ YES | Price to customer |
| **Fitting Price** | System suggests | ✅ YES | Alternative pricing |

**Pricing Flexibility:**

```
Scenario 1: Accept System Suggestions
- System suggests exchange rate: 132.50
- System suggests selling price: 800.00 (20% markup)
- User accepts both
✓ Quick entry, consistent pricing

Scenario 2: Override Exchange Rate
- System suggests: 132.50
- User overrides: 135.00 (actual bank rate)
- Landed cost automatically recalculates
✓ Accurate to actual cost

Scenario 3: Override Selling Price
- System suggests: 800.00
- User overrides: 750.00 (special customer pricing)
✓ Flexible pricing per batch

Scenario 4: Override Both
- User sets custom exchange rate
- User sets custom selling price
✓ Full control when needed
```

**Locked After Approval:**
- Once batch is APPROVED, exchange rate cannot change
- This maintains historical accuracy
- Selling price can still be updated if user has permission
- All changes logged in audit trail

### 3.10 Custom Images Support (URL-Based, No Uploads)

**Images for batches are stored as URLs, NOT uploaded files**

**Why URLs?**
- ✓ No heavy database storage
- ✓ No server storage limits
- ✓ Fast page loading
- ✓ Can use existing CDNs
- ✓ Easy to update images

**Image Types:**
1. **Technical Images** - Datasheets, specifications, diagrams
2. **Appearance Images** - Photos of the actual part

**How It Works:**

```
Batch Form:

Technical Image URL: https://cdn.supplier.com/datasheets/part-12345.pdf
Appearance Image URL: https://photos.ourcompany.com/parts/hydraulic-fluid.jpg

System stores URLs only, displays images from external sources
```

**Recommended Workflow:**
1. Upload images to your own CDN/cloud storage (AWS S3, Google Cloud, etc.)
2. Get permanent URLs
3. Paste URLs into batch form
4. System displays images via links

**Benefits:**
- Database stays lightweight
- No storage quotas
- Images can be high resolution
- Easy to share links

### 3.11 Inventory Permissions (Granular Control)

| Permission Code | Description |
|----------------|-------------|
| `inventory.view` | View inventory items and batches |
| `inventory.create` | Create new product records |
| `inventory.edit` | Edit product details |
| `inventory.receive` | Receive new batches |
| `inventory.approve_receipt` | Approve received batches |
| `inventory.issue` | Issue stock to jobs/users |
| `inventory.approve_issue` | Approve stock issues |
| `inventory.adjust` | Create stock adjustments (stocktake) |
| `inventory.approve_adjustment` | Approve adjustments |
| `inventory.return` | Return unused stock |
| `inventory.approve_return` | Approve returns |
| `inventory.quarantine` | Place batches on hold |
| `inventory.view_cost` | View cost/pricing data |
| `inventory.edit_pricing` | Modify selling prices |
| `inventory.manage_locations` | Manage bin/rack/row |

---

<a name="4-job-cards"></a>
## 4. Module 2 – Job Cards / Work Orders

Job cards behave like **mini-invoices** but are strictly technical.

### 4.1 Job Card Structure (Header-Detail)

**Job cards use a HEADER-DETAIL structure:**

```
┌─────────────────────────────────────────────┐
│ JOB CARD HEADER                             │
│ (Master Record - One per job)               │
├─────────────────────────────────────────────┤
│ • Job Card Number                           │
│ • Customer ID                               │
│ • Aircraft Registration                     │
│ • Aircraft Type                             │
│ • Date Opened                               │
│ • Date Closed                               │
│ • Status (OPEN / CLOSED)                    │
│ • Invoice Number                            │
│ • Opened By                                 │
│ • Closed By                                 │
└──────────────┬──────────────────────────────┘
               │
               │ ONE-TO-MANY
               │
               ▼
┌─────────────────────────────────────────────┐
│ JOB CARD ITEMS (DETAIL)                     │
│ (Detail Records - Many per job)             │
├─────────────────────────────────────────────┤
│ TAB 1: Main Warehouse Items                 │
│ TAB 2: Consumables                          │
│ TAB 3: Owner-Supplied Items (FOC)           │
│ TAB 4: Labour                               │
│                                             │
│ Each item stores:                           │
│ • Product/Service                           │
│ • Quantity                                  │
│ • Unit Cost                                 │
│ • Fitting Price                             │
│ • Tab Assignment (1/2/3/4)                  │
│ • Issued By                                 │
│ • Received By                               │
│ • Batch ID (if inventory)                   │
└─────────────────────────────────────────────┘
```

### 4.2 Job Card Header (Master Record)

**One header record per job containing:**

| Field | Description | Example |
|-------|-------------|---------|
| **Job Card Number** | Unique job ID | `JC-2025-0012` |
| **Customer** | Who owns the aircraft | `ABC Aviation Ltd` |
| **Aircraft Registration** | Aircraft reg number | `5Y-XYZ` |
| **Aircraft Type** | Aircraft model | `Cessna 172` |
| **Date Opened** | When job started | `2025-01-15` |
| **Date Closed** | When job completed | `2025-01-20` (or NULL if open) |
| **Status** | Current state | `OPEN` or `CLOSED` |
| **Invoice Number** | Billing reference | `INV-2025-1234` |
| **Opened By** | User who created job | `john.smith` |
| **Closed By** | User who closed job | `warehouse.manager` |
| **Description** | Work description | "100-hour inspection" |

**Status Rules:**
- `OPEN` = Job is active, items can be added/edited
- `CLOSED` = Job completed, locked, no more changes

**WIP Determination:**
- If Status = `OPEN` → **Job is Work In Progress (WIP)**
- If Status = `CLOSED` → Job is complete, **NOT in WIP**

No separate "IN_PROGRESS" status needed—if the job is OPEN, it's automatically WIP.

### 4.3 Job Card Items (Detail Records)

**Multiple item records per job, organized into 4 tabs:**

| Tab # | Tab Name | Description | Cost Handling |
|-------|----------|-------------|---------------|
| **1** | **Main Warehouse Items** | Standard inventory parts | Shows cost + fitting price |
| **2** | **Consumables** | Fluids, chemicals, expendables | Shows cost + fitting price |
| **3** | **Owner-Supplied (FOC)** | Customer-provided parts | **ALWAYS ZERO** |
| **4** | **Labour** | Work hours and rates | Labour cost only |

**Each item record stores:**

| Field | Description |
|-------|-------------|
| **Tab Assignment** | Which tab (1, 2, 3, or 4) |
| **Product/Service** | What item or service |
| **Quantity** | Amount used |
| **Unit Cost** | Our cost (from batch) |
| **Fitting Price** | Price charged to customer |
| **Batch ID** | Which batch (for tabs 1 & 2) |
| **Issued By** | Who issued the part |
| **Received By** | Engineer who received it |
| **Timestamp** | When issued |

### 4.4 Tab Features & Totals

**Each Tab Can Be:**
- ✅ **Printed separately** (individual tab reports)
- ✅ **Shows its own subtotal**
- ✅ **Combined into full job card** (all tabs together)

**Owner-Supplied Tab (Tab 3) Special Rules:**
- ✅ **No markup** applied
- ✅ **No cost** to customer  
- ✅ **Zero total** always
- ✅ Customer clearly sees these are FOC (Free Of Charge)

**Job Card Total Calculation:**

```
Tab 1 (Main Items):          10,800.00 KES
Tab 2 (Consumables):          1,125.00 KES
Tab 3 (Owner-Supplied):           0.00 KES  ← Always zero (FOC)
Tab 4 (Labour):               8,000.00 KES
────────────────────────────────────────────
JOB CARD TOTAL:              19,925.00 KES
```

### 4.5 Printing Options

**Two Print Formats Available:**

| Format | Shows | Audience | Prices |
|--------|-------|----------|--------|
| **Customer Copy** | Fitting prices only | Customer/Owner | Selling prices |
| **Internal Copy** | Cost + Fitting + Profit | Management/Finance | Both prices + margin |

**Customer Copy Example:**

```
════════════════════════════════════════════════════════════
                        JOB CARD
════════════════════════════════════════════════════════════
Job Card No:  JC-2025-0012
Customer:     ABC Aviation Ltd
Aircraft:     5Y-XYZ (Cessna 172)
Date Opened:  2025-01-15
Date Closed:  2025-01-20

────────────────────────────────────────────────────────────
TAB 1: MAIN WAREHOUSE ITEMS
────────────────────────────────────────────────────────────
Part Number      Description           Qty    Price    Total
HYD-FLUID-41     Hydraulic Fluid      10.5L   800.00  8,400.00
OIL-FILTER-23    Oil Filter - Lyc      2 EA 1,200.00  2,400.00
                                              ─────────────
                                     TAB 1 TOTAL: 10,800.00

────────────────────────────────────────────────────────────
TAB 2: CONSUMABLES  
────────────────────────────────────────────────────────────
Part Number      Description           Qty    Price    Total
PAINT-WHITE      Gloss White Paint    2.5L   450.00  1,125.00
                                              ─────────────
                                     TAB 2 TOTAL:  1,125.00

────────────────────────────────────────────────────────────
TAB 3: OWNER-SUPPLIED ITEMS (FREE OF CHARGE)
────────────────────────────────────────────────────────────
Part Number      Description           Qty    Price    Total
SPARK-PLUGS      Spark Plugs           8 EA     0.00      0.00
                                              ─────────────
                                     TAB 3 TOTAL:      0.00
                              (Customer-supplied parts)

────────────────────────────────────────────────────────────
TAB 4: LABOUR
────────────────────────────────────────────────────────────
Description                        Hours    Rate     Total
100-Hour Inspection                 16.0   500.00  8,000.00
                                              ─────────────
                                     TAB 4 TOTAL:  8,000.00

════════════════════════════════════════════════════════════
                             JOB CARD TOTAL:     19,925.00
════════════════════════════════════════════════════════════
```

**Internal Copy Example (WITH COSTS & PROFIT):**

```
════════════════════════════════════════════════════════════
              JOB CARD - INTERNAL COPY
           (SHOWS COST, FITTING PRICE & PROFIT)
════════════════════════════════════════════════════════════
Job Card No:  JC-2025-0012
Customer:     ABC Aviation Ltd
Aircraft:     5Y-XYZ

────────────────────────────────────────────────────────────
TAB 1: MAIN WAREHOUSE ITEMS
────────────────────────────────────────────────────────────
Part Number    Description   Qty  Unit Cost  Fitting  Profit
HYD-FLUID-41   Hydraulic    10.5L   662.50   800.00  137.50
OIL-FILTER-23  Oil Filter    2 EA   950.00 1,200.00  250.00
                                   ──────────────────────
                             Cost:  8,858.25
                          Fitting: 10,800.00
                           Profit:  1,941.75  (21.9%)

────────────────────────────────────────────────────────────
TAB 2: CONSUMABLES
────────────────────────────────────────────────────────────
Part Number    Description   Qty  Unit Cost  Fitting  Profit
PAINT-WHITE    Gloss White  2.5L   320.00   450.00  130.00
                                   ──────────────────────
                             Cost:    800.00
                          Fitting:  1,125.00
                           Profit:    325.00  (40.6%)

────────────────────────────────────────────────────────────
TAB 3: OWNER-SUPPLIED (FOC - NO COST/CHARGE)
────────────────────────────────────────────────────────────
Part Number    Description   Qty  Unit Cost  Fitting  Profit
SPARK-PLUGS    Spark Plugs   8 EA     0.00     0.00    0.00
                                   ──────────────────────
                             Cost:      0.00
                          Fitting:      0.00
                           Profit:      0.00

────────────────────────────────────────────────────────────
TAB 4: LABOUR
────────────────────────────────────────────────────────────
Description            Hours  Cost Rate  Charge Rate  Margin
100-Hour Inspection     16.0       0.00       500.00  500.00
                                   ──────────────────────
                             Cost:      0.00
                           Charge:  8,000.00
                           Margin:  8,000.00

════════════════════════════════════════════════════════════
TOTAL COST:                                          9,658.25
TOTAL FITTING PRICE (CHARGED):                      19,925.00
TOTAL PROFIT:                                       10,266.75
PROFIT MARGIN:                                          51.5%
════════════════════════════════════════════════════════════
```

**Key Points:**

✅ **Customer Copy:** Fitting prices only (what they pay)  
✅ **Internal Copy:** Cost + Fitting + Profit breakdown  
✅ **Owner-supplied:** Always ZERO on both copies  
✅ **Job total:** Excludes owner-supplied items  
✅ **Profit visibility:** Requires `jobcard.view_profit` permission

### 4.6 Parts Traceability (Issued By / Received By)

**Every part on a job card tracks full traceability INCLUDING batch number:**

| Field | Description | Example |
|-------|-------------|---------|
| **Batch Number** | **CRITICAL: Which batch used** | **`B-2025-0023`** |
| **Batch ID** | Database reference | UUID of batch record |
| **Product** | What was issued | "Oil Filter - Lycoming" |
| **Quantity** | Amount issued | `2.00 EA` |
| **Unit Cost** | Cost from batch | `1,250.00 KES` |
| **Fitting Price** | Price to customer | `1,500.00 KES` |
| **Tab Assignment** | Which tab (1/2/3/4) | `1` (Main Warehouse) |
| **Issued By** | User who issued | `john.smith` (storekeeper) |
| **Issued At** | Timestamp | `2025-01-20 10:15:00` |
| **Received By** | Engineer who received | `mike.johnson` (engineer) |
| **Received At** | When received | `2025-01-20 10:20:00` |
| **Job Card** | Which job | `JC-2025-0012` |
| **Notes** | Optional comments | "Replaced during inspection" |

**Why Batch Number is Critical:**

✅ **Complete traceability** - Know exactly which batch was used  
✅ **Batch recalls** - If batch has issue, find all jobs that used it  
✅ **FIFO verification** - Confirm oldest batches used first  
✅ **Supplier tracking** - Trace parts back to specific supplier  
✅ **Cost accuracy** - Each batch has its own cost  
✅ **Aviation compliance** - Required for regulatory audit trail

**Example Job Card Item Record:**

```
Job Card: JC-2025-0012
Item: Oil Filter - Lycoming
Batch Number: B-2025-0023  ← SHOWN ON JOB CARD
Batch ID: 650e8400-e29b-41d4-a716-446655440001
Quantity: 2.00 EA
Unit Cost: 1,250.00 KES (from batch B-2025-0023)
Fitting Price: 1,500.00 KES
Issued By: john.smith
Issued At: 2025-01-20 10:15:00
Received By: mike.johnson
Received At: 2025-01-20 10:20:00
```

**Database Schema for Job Card Items:**

```sql
CREATE TABLE job_card_items (
  id                CHAR(36) PRIMARY KEY,
  job_card_id       CHAR(36) NOT NULL,
  
  -- Product & Batch Reference
  product_id        CHAR(36) NOT NULL,
  batch_id          CHAR(36),                 -- FK to inventory_batches
  batch_number      VARCHAR(100),             -- DENORMALIZED for display
  
  -- Tab Assignment
  tab_number        INT NOT NULL,             -- 1/2/3/4
  
  -- Quantities & Pricing
  quantity          DECIMAL(10,4) NOT NULL,
  unit_cost         DECIMAL(10,4) NOT NULL,
  fitting_price     DECIMAL(10,4) NOT NULL,
  total_cost        DECIMAL(15,2) NOT NULL,
  total_fitting     DECIMAL(15,2) NOT NULL,
  
  -- Traceability
  issued_by         CHAR(36),
  issued_at         DATETIME,
  received_by       CHAR(36),
  received_at       DATETIME,
  
  -- Additional
  notes             TEXT,
  
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
  FOREIGN KEY (product_id) REFERENCES inventory_products(id),
  FOREIGN KEY (batch_id) REFERENCES inventory_batches(id),
  FOREIGN KEY (issued_by) REFERENCES users(id),
  FOREIGN KEY (received_by) REFERENCES users(id),
  
  -- Indexes
  INDEX idx_job_card (job_card_id),
  INDEX idx_product (product_id),
  INDEX idx_batch (batch_id),
  INDEX idx_batch_number (batch_number)
);
```

**Why Batch Number is Critical:**
- ✓ **Accountability** - Know who issued and received every part
- ✓ **Batch traceability** - Track which specific batch was used
- ✓ **Audit trail** - Complete traceability for compliance
- ✓ **Dispute resolution** - "Who took 10 filters last month from which batch?"
- ✓ **Aviation regulations** - Required for certification
- ✓ **Batch recalls** - If supplier recalls batch B-2025-0023, find all jobs using it

### 4.7 Job Card Workflow

**Complete Job Card Lifecycle:**

```
STEP 1: OPEN JOB
┌─────────────────────────────────────────┐
│ Status: OPEN                            │
│ Action: Create job card                 │
│ Required:                               │
│   • Customer information                │
│   • Aircraft registration               │
│   • Aircraft type                       │
│   • Work description                    │
│ Permission: jobcard.create              │
└─────────────────────────────────────────┘
                  ↓
STEP 2: ADD PARTS & LABOUR
┌─────────────────────────────────────────┐
│ Status: OPEN (automatically WIP)        │
│ Actions:                                │
│   • Issue parts to Tab 1 (Main)         │
│   • Issue parts to Tab 2 (Consumables)  │
│   • Record Tab 3 (Owner-Supplied)       │
│   • Add Tab 4 (Labour hours)            │
│   • Track issued_by / received_by       │
│ Permissions:                            │
│   • jobcard.add_parts                   │
│   • jobcard.add_labour                  │
└─────────────────────────────────────────┘
                  ↓
STEP 3: REVIEW JOB
┌─────────────────────────────────────────┐
│ Status: OPEN                            │
│ Actions:                                │
│   • Verify all parts issued             │
│   • Check labour hours                  │
│   • Calculate totals                    │
│   • Ensure invoice number filled        │
│ Permission: jobcard.view                │
└─────────────────────────────────────────┘
                  ↓
STEP 4: CLOSE JOB
┌─────────────────────────────────────────┐
│ Status: CLOSED                          │
│ Requirements:                           │
│   • Invoice number MUST be filled       │
│   • Permission: jobcard.close           │
│ Effects:                                │
│   • Job locked (no more edits)          │
│   • Parts released from WIP             │
│   • Job no longer shows in WIP reports  │
│ Note: Can reopen with jobcard.reopen    │
└─────────────────────────────────────────┘
                  ↓
STEP 5: INVOICE (OPTIONAL EDIT)
┌─────────────────────────────────────────┐
│ Status: CLOSED                          │
│ Action:                                 │
│   • Edit invoice number if needed       │
│ Permission: jobcard.edit_invoice        │
│ Integration: Links to QuickBooks        │
└─────────────────────────────────────────┘
```

**Status Summary:**

| Status | Meaning | WIP? | Can Edit? |
|--------|---------|------|-----------|
| **OPEN** | Job active, work ongoing | **YES** | ✅ YES |
| **CLOSED** | Job complete, locked | **NO** | ❌ NO (unless reopened) |

**No "IN_PROGRESS" status needed:**
- If Status = `OPEN` → Job is automatically in WIP
- WIP reports simply query: `WHERE status = 'OPEN'`

### 4.8 Work In Progress (WIP) Detection

**Automatic WIP Determination:**

```sql
-- Jobs in WIP: All jobs with status = OPEN
SELECT * FROM job_cards WHERE status = 'OPEN';

-- Parts in WIP: All items in OPEN jobs
SELECT ji.* 
FROM job_card_items ji
INNER JOIN job_cards jc ON ji.job_card_id = jc.id
WHERE jc.status = 'OPEN';

-- Stock reserved in WIP
SELECT 
  p.part_number,
  SUM(ji.quantity) as qty_in_wip
FROM job_card_items ji
INNER JOIN job_cards jc ON ji.job_card_id = jc.id
INNER JOIN inventory_products p ON ji.product_id = p.id
WHERE jc.status = 'OPEN'
GROUP BY p.id;
```

**Impact on Inventory:**

```
Product: Oil Filter
─────────────────────────────────────
Total Stock (All Batches):   50 units

Reserved in WIP Jobs:
  Job JC-001 (OPEN):         -5 units
  Job JC-002 (OPEN):         -3 units
  Job JC-003 (CLOSED):        0 units (not in WIP)
─────────────────────────────────────
Available Stock:             42 units
```

**WIP Reports Automatically Show:**
- Jobs where `status = 'OPEN'`
- Parts in those jobs
- Total value tied up
- Parts that might be returned

### 4.9 Closing Job Requirements

**Before closing a job, ensure:**

✅ **Invoice number filled** - Required field  
✅ **Permission granted** - User has `jobcard.close`  
✅ **All work complete** - Parts issued, labour recorded  
✅ **Totals verified** - Review final amounts

**Effects of Closing:**
- Status changes to `CLOSED`
- Job no longer appears in WIP reports
- Parts released from WIP status → Status becomes `OUT`
- Job locked (no edits without reopening)
- WIP stock value decreases
- Stock location changes from "Work in Progress" to "Out"

**Reopening a Closed Job:**
- Requires `jobcard.reopen` permission
- Changes status back to `OPEN`
- Job returns to WIP reports
- Parts return to WIP status
- Edits allowed again

---

## 4A. STOCK LOCATION TRACKING & CALCULATION

### 4A.1 Stock Location States

**Every item in the system exists in ONE of these states:**

| Location State | Condition | Counted in Available Stock? | Report Category |
|---------------|-----------|----------------------------|-----------------|
| **Total** | Sum of all batches received | N/A | Total received |
| **In Stock** | Approved & not issued | ✅ YES | Available |
| **Quarantine** | Not approved (pending) | ❌ NO | On hold |
| **Work in Progress (WIP)** | Issued to OPEN job | ❌ NO | Reserved |
| **Out** | Issued to CLOSED job | ❌ NO | Consumed |
| **Withheld** | Adjustment (negative) | ❌ NO | Adjustment |

### 4A.2 Stock Calculation Formula

**For any product at any time:**

```
TOTAL = All batches received (sum of quantity_received)

IN STOCK = Batches where:
           • status = 'APPROVED'
           • quantity > 0
           • NOT issued to jobs
           
QUARANTINE = Batches where:
             • status = 'PENDING' (awaiting approval)
             
WORK IN PROGRESS = Parts issued to jobs where:
                   • job_cards.status = 'OPEN'
                   
OUT = Parts issued to jobs where:
      • job_cards.status = 'CLOSED'
      
WITHHELD = Stock adjustments (negative):
           • adjustment transactions with negative quantity
```

**Complete Formula:**

```
TOTAL = IN STOCK + QUARANTINE + WIP + OUT + WITHHELD

Example:
Total:        1200 units (all batches received)
In Stock:      900 units (available)
Quarantine:    150 units (not approved)
WIP:           150 units (in open jobs)
Out:             0 units (no closed jobs yet with these parts)
Withheld:        0 units (no adjustments)
```

### 4A.3 Stock Location Visualization

**Dashboard View (Like Your Image):**

```
┌─────────────────────────────────────────────────────────┐
│                     INVENTORY                           │
│                Track stock & batches                    │
│                                                         │
│            ╭────────────────────╮                       │
│           ╱                      ╲                      │
│          │      [████████]        │  1200 Total        │
│          │     [████]             │   900 In Stock     │
│          │    [██]                │   150 Out          │
│          │   [█]                  │   150 Withheld     │
│           ╲                      ╱                      │
│            ╰────────────────────╯                       │
│                                                         │
│   1200        900        150          150              │
│   Total    In Stock     Out        Withheld            │
└─────────────────────────────────────────────────────────┘
```

**Breakdown by Location:**

```
Product: Hydraulic Fluid AeroShell 41
Unit: Liters (L)

╔════════════════════════════════════════════════════════╗
║                    STOCK SUMMARY                       ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  TOTAL (All Batches):                    1,200.00 L   ║
║                                                        ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ IN STOCK (Available):              900.00 L     │  ║
║  │   Batch B-2024-0145:    250.00 L                │  ║
║  │   Batch B-2025-0003:    450.00 L                │  ║
║  │   Batch B-2025-0012:    200.00 L                │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                        ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ QUARANTINE (Not Approved):         150.00 L     │  ║
║  │   Batch B-2025-0023:    150.00 L (PENDING)      │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                        ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ WORK IN PROGRESS:                  150.00 L     │  ║
║  │   Job JC-001 (OPEN):     75.00 L                │  ║
║  │     Batch B-2024-0145:   75.00 L                │  ║
║  │   Job JC-002 (OPEN):     75.00 L                │  ║
║  │     Batch B-2025-0003:   75.00 L                │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                        ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ OUT (Consumed):                      0.00 L     │  ║
║  │   (No closed jobs yet)                          │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                        ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ WITHHELD (Adjustments):              0.00 L     │  ║
║  │   (No adjustments)                              │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Verification: 900 + 150 + 150 + 0 + 0 = 1200 ✓
```

### 4A.4 SQL Queries for Stock Calculation

**Query 1: Total Stock**

```sql
SELECT 
  p.part_number,
  p.description,
  COALESCE(SUM(b.quantity_received), 0) as total_received
FROM inventory_products p
LEFT JOIN inventory_batches b ON p.id = b.product_id
WHERE p.id = ?
GROUP BY p.id;
```

**Query 2: In Stock (Available)**

```sql
SELECT 
  p.part_number,
  COALESCE(SUM(b.quantity), 0) as in_stock
FROM inventory_products p
LEFT JOIN inventory_batches b 
  ON p.id = b.product_id
  AND b.status = 'APPROVED'
  AND b.quantity > 0
WHERE p.id = ?
  AND b.id NOT IN (
    -- Exclude batches with items in jobs
    SELECT DISTINCT batch_id 
    FROM job_card_items 
    WHERE batch_id IS NOT NULL
  )
GROUP BY p.id;
```

**Query 3: Quarantine (Not Approved)**

```sql
SELECT 
  p.part_number,
  COALESCE(SUM(b.quantity), 0) as quarantine
FROM inventory_products p
LEFT JOIN inventory_batches b 
  ON p.id = b.product_id
  AND b.status = 'PENDING'
WHERE p.id = ?
GROUP BY p.id;
```

**Query 4: Work in Progress**

```sql
SELECT 
  p.part_number,
  COALESCE(SUM(jci.quantity), 0) as wip
FROM inventory_products p
LEFT JOIN job_card_items jci ON p.id = jci.product_id
LEFT JOIN job_cards jc ON jci.job_card_id = jc.id
WHERE p.id = ?
  AND jc.status = 'OPEN'
GROUP BY p.id;
```

**Query 5: Out (Consumed in Closed Jobs)**

```sql
SELECT 
  p.part_number,
  COALESCE(SUM(jci.quantity), 0) as out
FROM inventory_products p
LEFT JOIN job_card_items jci ON p.id = jci.product_id
LEFT JOIN job_cards jc ON jci.job_card_id = jc.id
WHERE p.id = ?
  AND jc.status = 'CLOSED'
GROUP BY p.id;
```

**Query 6: Withheld (Adjustments)**

```sql
SELECT 
  p.part_number,
  COALESCE(SUM(
    CASE 
      WHEN it.transaction_type = 'ADJUSTMENT' 
        AND it.quantity < 0 
      THEN ABS(it.quantity)
      ELSE 0
    END
  ), 0) as withheld
FROM inventory_products p
LEFT JOIN inventory_transactions it ON p.id = it.product_id
WHERE p.id = ?
  AND it.status = 'APPROVED'
GROUP BY p.id;
```

**Query 7: Complete Stock Summary (All Locations)**

```sql
SELECT 
  p.part_number,
  p.description,
  p.unit_of_measure,
  
  -- Total
  COALESCE(SUM(b.quantity_received), 0) as total,
  
  -- In Stock (Available)
  COALESCE(SUM(
    CASE 
      WHEN b.status = 'APPROVED' 
        AND b.quantity > 0
        AND b.id NOT IN (
          SELECT DISTINCT batch_id 
          FROM job_card_items 
          WHERE batch_id IS NOT NULL
        )
      THEN b.quantity
      ELSE 0
    END
  ), 0) as in_stock,
  
  -- Quarantine
  COALESCE(SUM(
    CASE WHEN b.status = 'PENDING' THEN b.quantity ELSE 0 END
  ), 0) as quarantine,
  
  -- WIP
  COALESCE((
    SELECT SUM(jci.quantity)
    FROM job_card_items jci
    INNER JOIN job_cards jc ON jci.job_card_id = jc.id
    WHERE jci.product_id = p.id
      AND jc.status = 'OPEN'
  ), 0) as wip,
  
  -- Out
  COALESCE((
    SELECT SUM(jci.quantity)
    FROM job_card_items jci
    INNER JOIN job_cards jc ON jci.job_card_id = jc.id
    WHERE jci.product_id = p.id
      AND jc.status = 'CLOSED'
  ), 0) as out,
  
  -- Withheld
  COALESCE((
    SELECT SUM(ABS(it.quantity))
    FROM inventory_transactions it
    WHERE it.product_id = p.id
      AND it.transaction_type = 'ADJUSTMENT'
      AND it.quantity < 0
      AND it.status = 'APPROVED'
  ), 0) as withheld

FROM inventory_products p
LEFT JOIN inventory_batches b ON p.id = b.product_id
WHERE p.id = ?
GROUP BY p.id;
```

### 4A.5 Stock Movement Flow

**How items flow through states:**

```
═══════════════════════════════════════════════════════════════
                   STOCK MOVEMENT FLOW
═══════════════════════════════════════════════════════════════

STEP 1: RECEIVE BATCH
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Batch created                     ┃
┃ • Status: PENDING                   ┃
┃ • Location: QUARANTINE              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 2: APPROVE BATCH
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Status: APPROVED                  ┃
┃ • Location: IN STOCK                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓
    ┌────────────┴────────────┐
    ↓                         ↓

PATH A: Issue to Job          PATH B: Stocktake Adjustment
┏━━━━━━━━━━━━━━━━━━━┓         ┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Issue to OPEN job ┃         ┃ Negative adjustment    ┃
┃ Location: WIP     ┃         ┃ Location: WITHHELD     ┃
┗━━━━━━━━━━━━━━━━━━━┛         ┗━━━━━━━━━━━━━━━━━━━━━━━━┛
         ↓                              ↓
┏━━━━━━━━━━━━━━━━━━━┓                   │
┃ Close job         ┃                   │
┃ Location: OUT     ┃                   │
┗━━━━━━━━━━━━━━━━━━━┛                   │
         ↓                              ↓
         └──────────────┬───────────────┘
                        ↓

FINAL STATE: Stock Fully Accounted For
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Total = In Stock + Quarantine + WIP + Out + Withheld  ┃
┃                                                         ┃
┃ Every item is accounted for in one of these locations  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

═══════════════════════════════════════════════════════════════
```

### 4A.6 Stock Reports

**Report 1: Stock Location Summary**

```
STOCK LOCATION REPORT
Product: All Products
Date: 2025-01-31

Part Number       Description          Total   In Stock  Quarantine  WIP    Out  Withheld
HYD-FLUID-41      Hydraulic Fluid     1200 L    900 L      150 L    150 L   0 L     0 L
OIL-FILTER-23     Oil Filter           500 EA   380 EA      50 EA    70 EA   0 EA    0 EA
PAINT-WHITE       Gloss Paint          100 L     75 L        0 L     20 L   5 L     0 L
────────────────────────────────────────────────────────────────────────────────────────
TOTALS:                              1800      1355        200      240     5       0

Verification: 1355 + 200 + 240 + 5 + 0 = 1800 ✓
```

**Report 2: WIP Detail (Which Jobs Have Which Parts)**

```
WORK IN PROGRESS DETAIL REPORT
Date: 2025-01-31

Job Card      Customer        Status  Part Number      Batch Number  Qty     Value
JC-001        ABC Aviation    OPEN    HYD-FLUID-41     B-2024-0145   75 L    49,687.50
JC-001        ABC Aviation    OPEN    OIL-FILTER-23    B-2025-0003   20 EA   25,000.00
JC-002        XYZ Ops         OPEN    HYD-FLUID-41     B-2025-0003   75 L    50,062.50
JC-002        XYZ Ops         OPEN    OIL-FILTER-23    B-2025-0012   50 EA   62,500.00
────────────────────────────────────────────────────────────────────────────────────
TOTAL WIP VALUE:                                                        187,250.00
```

**Report 3: Items in Quarantine**

```
QUARANTINE REPORT (Batches Awaiting Approval)
Date: 2025-01-31

Batch Number  Product          Qty     Status    Received Date  Days Pending
B-2025-0023   HYD-FLUID-41    150 L   PENDING   2025-01-25     6 days
B-2025-0024   OIL-FILTER-23    50 EA  PENDING   2025-01-28     3 days
────────────────────────────────────────────────────────────────────────────
TOTAL QUARANTINE:            200 units
```

**Report 4: Consumed Items (Out)**

```
CONSUMED ITEMS REPORT (From Closed Jobs)
Date Range: 2025-01-01 to 2025-01-31

Job Card      Closed Date  Product          Batch Number  Qty     Cost
JC-099        2025-01-15   PAINT-WHITE      B-2024-0088   5 L     1,600.00
────────────────────────────────────────────────────────────────────────
TOTAL OUT:                                                 5 units
```

### 4A.7 Key Principles

✅ **Every item accounted for:** Total = Stock + Quarantine + WIP + Out + Withheld  
✅ **Real-time accuracy:** Stock calculations use current job status  
✅ **Batch traceability:** WIP shows which batch number used in which job  
✅ **Automatic WIP:** If job OPEN, parts automatically in WIP  
✅ **Automatic OUT:** When job CLOSED, parts become OUT  
✅ **No manual status:** System determines location from batch/job status

### 4.10 Owner-Supplied Items (FOC)

**Every part transaction on a job card tracks:**

| Field | Description | Example |
|-------|-------------|---------|
| **Batch ID** | Specific batch used | `B-2025-0023` |
| **Product** | What was issued | "Oil Filter - Lycoming" |
| **Quantity** | Amount issued | `2.00 EA` |
| **Unit Cost** | Cost from batch | `1,250.00 KES` |
| **Total Cost** | Quantity × Unit Cost | `2,500.00 KES` |
| **Issued By** | User who issued | `john.smith` |
| **Issued At** | Timestamp | `2025-01-20 10:15:00` |
| **Received By** | Engineer who received | `mike.johnson` (engineer) |
| **Received At** | When received | `2025-01-20 10:20:00` |
| **Job Card** | Which job | `JC-2025-0012` |
| **Notes** | Optional comments | "Replaced during 100hr inspection" |

**Why This Matters:**
- ✓ **Accountability** - Know who issued and received every part
- ✓ **Audit trail** - Complete traceability
- ✓ **Dispute resolution** - "Who took 10 filters last month?"
- ✓ **Compliance** - Aviation regulatory requirements

### 4.10 Owner-Supplied Items (FOC)

**Special Handling for Customer-Provided Parts:**

| Aspect | Regular Parts | Owner-Supplied |
|--------|--------------|----------------|
| **Cost to Customer** | Fitting price charged | **ZERO** |
| **Our Cost** | From batch | **ZERO** |
| **Inventory Impact** | Reduces our stock | No impact on our inventory |
| **Traceability** | Full tracking | Full tracking |
| **Printing** | Tab 1 or Tab 2 | Separate Tab 3 |
| **Invoice Total** | Included | **Excluded** |

**Why Separate Tab?**
- Customer clearly sees they're not being charged
- Transparent separation of charges
- Aviation compliance requirements
- Avoids confusion about billing

### 4.11 Job Card Permissions

| Permission Code | Description |
|----------------|-------------|
| `jobcard.view` | View job cards |
| `jobcard.create` | Create new job cards |
| `jobcard.edit` | Edit job details |
| `jobcard.delete` | Delete/cancel jobs |
| `jobcard.add_labour` | Add labour entries |
| `jobcard.edit_labour` | Modify labour entries |
| `jobcard.add_parts` | Add parts to job |
| `jobcard.remove_parts` | Remove parts |
| `jobcard.close` | Close completed jobs |
| `jobcard.reopen` | Reopen closed jobs |
| `jobcard.view_cost` | View costs |
| `jobcard.edit_invoice` | Edit invoice number |
| `jobcard.print` | Print job cards |
| `jobcard.view_profit` | View profitability |

---

<a name="6-rotables"></a>
## 5. Module 3 – Rotables (Serialized Components)

Tracks aviation parts with **serial numbers** and **full lifecycle** management.

### 5.1 What are Rotables?

**Rotables** are high-value aviation components that:
- Have unique serial numbers
- Are tracked individually (not in batches)
- Require periodic service/overhaul
- Have service intervals (hours or calendar)
- Must maintain complete history

**Examples:**
- Propellers
- Engine accessories
- Landing gear components
- Instruments
- Hydraulic pumps

### 5.2 Rotable Data Structure

| Field | Description | Example |
|-------|-------------|---------|
| **Serial Number** | Unique identifier | `SN-12345-ABC` |
| **Part Number** | Manufacturer P/N | `LYC-76851` |
| **Description** | Component name | "Vacuum Pump - Lycoming" |
| **Supplier** | Where purchased/serviced | "Lycoming Authorized Service" |
| **Status** | Current state | `IN_STOCK`, `INSTALLED`, `OVERHAUL` |
| **Location** | Current location | "Warehouse A" or "Aircraft 5Y-ABC" |
| **Time Since Overhaul (TSO)** | Hours since last service | `450.5 hrs` |
| **Last Service Date** | When serviced | `2024-06-15` |
| **Next Service Due** | Calendar due date | `2025-12-15` |
| **Service Interval** | Hours between services | `500 hrs` |
| **Purchase Cost** | Original cost | `125,000 KES` |
| **Total Service Cost** | Cumulative service cost | `45,000 KES` |
| **Notes** | Additional info | "Overhauled by XYZ Ltd" |

### 5.3 Rotable Lifecycle

**Components follow a continuous cycle of use and service:**

```
═══════════════════════════════════════════════════════════════
                   ROTABLE LIFECYCLE
═══════════════════════════════════════════════════════════════

STEP 1: PURCHASE
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Component acquired (new/used)     ┃
┃ • Record serial & part number       ┃
┃ • Set TSO = 0 (if new)              ┃
┃ • Status: IN_STOCK                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 2: INSTALL
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Fitted to aircraft                ┃
┃ • Record installation date          ┃
┃ • Link to aircraft registration     ┃
┃ • Status: INSTALLED                 ┃
┃ • TSO starts accumulating           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 3: REMOVE (When Due)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Taken off for service             ┃
┃ • Record removal date & TSO         ┃
┃ • Status: REMOVED                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 4: OVERHAUL / REPAIR
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Send to certified facility        ┃
┃ • Record service provider           ┃
┃ • Track service cost                ┃
┃ • Reset TSO to 0 after service      ┃
┃ • Status: OVERHAUL                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 5: REINSTALL (Return to Service)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Available for installation        ┃
┃ • Status: IN_STOCK                  ┃
┃ • CYCLE REPEATS (back to Step 2)    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓
    ┌────────────┘
    │ Continuous Loop
    └───► Back to STEP 2: INSTALL

OPTIONAL: SCRAP (End of Life)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Component beyond economical repair┃
┃ • Status: SCRAPPED                  ┃
┃ • Retained for history              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

═══════════════════════════════════════════════════════════════
```

**Lifecycle Stages:**

1. **Purchase** - Component acquired
   - Record serial/part number
   - Set initial TSO = 0
   - Status: `IN_STOCK`

2. **Install** - Fitted to aircraft
   - Record installation date
   - Link to aircraft
   - Status: `INSTALLED`
   - TSO starts accumulating

3. **Remove** - Taken off for service
   - Record removal date & TSO
   - Status: `REMOVED`

4. **Overhaul/Repair** - Serviced by certified facility
   - Send to overhaul facility
   - Record service cost
   - Reset TSO to 0
   - Status: `OVERHAUL`

5. **Reinstall** - Return to service
   - Available for installation
   - Status: `IN_STOCK`
   - Cycle repeats

6. **Scrap** - End of life (optional)
   - Component retired
   - Status: `SCRAPPED`

### 5.4 Service Interval Tracking

**Two Types of Intervals:**

| Type | Measurement | Example |
|------|-------------|---------|
| **Calendar** | Days/months from service | "Every 12 months" |
| **Operating Hours** | TSO limit | "Every 500 flight hours" |
| **Whichever Comes First** | Combined | "12 months OR 500 hours" |

**Alert System:**
```
Component: Vacuum Pump SN-12345
Service Interval: 500 hours OR 12 months
Last Service: 2024-06-15 (TSO reset to 0)
Current TSO: 480 hours
Current Date: 2025-12-01

Alerts:
⚠️ WARNING: 20 hours until service due (480/500)
⚠️ WARNING: 14 days until calendar due (Dec 15, 2025)
```

### 5.5 Service History

Every service event is recorded:

| Date | Service Type | Facility | Cost | TSO Reset | Notes |
|------|-------------|----------|------|-----------|-------|
| 2024-06-15 | Overhaul | ABC Overhaul | 45,000 | Yes (0.0) | Complete overhaul |
| 2023-12-10 | Repair | XYZ Repair | 12,000 | No | Seal replacement |
| 2023-06-20 | Inspection | DEF Inspection | 5,000 | No | 100hr check |

### 5.6 Rotables Permissions

| Permission Code | Description |
|----------------|-------------|
| `rotables.view` | View rotable components |
| `rotables.create` | Add new rotables |
| `rotables.edit` | Edit details |
| `rotables.install` | Mark as installed |
| `rotables.remove` | Mark as removed |
| `rotables.service` | Record service/overhaul |
| `rotables.view_service_cost` | View service costs |
| `rotables.edit_service_cost` | Edit service costs |
| `rotables.view_alerts` | See overdue alerts |

---

<a name="6-tools"></a>
## 6. Module 4 – Tools Tracking

Tracks **portable/issueable tools** with calibration management.

### 6.1 Tool Data Structure

| Field | Description | Example |
|-------|-------------|---------|
| **Tool ID** | Unique identifier | `TOOL-001` |
| **Name** | Tool name | "Torque Wrench 0-150 ft-lb" |
| **Description** | Details | "Snap-On Model XYZ123" |
| **Status** | Current state | `AVAILABLE`, `ISSUED`, `CALIBRATION` |
| **Purchase Cost** | Original cost | `15,000 KES` (optional, confidential) |
| **Calibration Required** | Yes/No | `Yes` |
| **Last Calibration** | Date calibrated | `2024-11-15` |
| **Next Calibration Due** | Due date | `2025-11-15` (12 months) |
| **Currently Issued To** | User holding tool | `john.smith` |
| **Issued At** | Issue timestamp | `2025-01-10 08:30` |

### 6.2 Tool Issue/Return Flow

```
═══════════════════════════════════════════════════════════════
                   TOOL ISSUE/RETURN FLOW
═══════════════════════════════════════════════════════════════

STEP 1: AVAILABLE
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Tool in stock                     ┃
┃ • Status: AVAILABLE                 ┃
┃ • Ready for issue                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 2: ISSUE TOOL
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Actions:                            ┃
┃ • Scan/select tool                  ┃
┃ • Scan/select user                  ┃
┃ • System records:                   ┃
┃   - Tool ID                         ┃
┃   - User ID                         ┃
┃   - Issue timestamp                 ┃
┃ • Status: ISSUED                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 3: USER HOLDS TOOL
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Tool with user                    ┃
┃ • Status: ISSUED                    ┃
┃ • Days counter running              ┃
┃ • Alert if > 7 days                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 4: RETURN TOOL
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Actions:                            ┃
┃ • Scan/select tool                  ┃
┃ • System records:                   ┃
┃   - Return timestamp                ┃
┃   - Condition check                 ┃
┃ • Status: AVAILABLE                 ┃
┃ • Back to Step 1                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓
    ┌────────────┘
    │ Cycle repeats
    └───► Back to STEP 1: AVAILABLE

═══════════════════════════════════════════════════════════════
```

**Issue Process:**
1. Scan/select tool
2. Scan/select user
3. System records:
   - Tool ID
   - User ID
   - Issue timestamp
   - Status → `ISSUED`

**Return Process:**
1. Scan/select tool
2. System records:
   - Return timestamp
   - Condition check
   - Status → `AVAILABLE`

### 6.3 Calibration Management

**Calibration Schedule:**
- Tools requiring calibration are flagged
- Due dates calculated from last calibration
- Alerts shown to authorized users

**Calibration Workflow:**

```
═══════════════════════════════════════════════════════════════
                   CALIBRATION WORKFLOW
═══════════════════════════════════════════════════════════════

STEP 1: DUE SOON (30 days warning)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Alert shows to users              ┃
┃ • Tool still usable                 ┃
┃ • Schedule calibration              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 2: SEND FOR CALIBRATION
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Tool sent to calibration lab      ┃
┃ • Status: CALIBRATION               ┃
┃ • Not available for issue           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓

STEP 3: CALIBRATED (Return from lab)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • Record calibration date           ┃
┃ • Set next due date (e.g., +12 mo)  ┃
┃ • Status: AVAILABLE                 ┃
┃ • Ready for use                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

═══════════════════════════════════════════════════════════════
```

### 6.4 Overdue Tools Report

**Identify tools not returned:**

| Tool | Issued To | Issued Date | Days Out | Status |
|------|-----------|-------------|----------|--------|
| Torque Wrench #1 | john.smith | 2024-12-15 | 47 days | ⚠️ Overdue |
| Multimeter #3 | mike.jones | 2025-01-25 | 6 days | ⚠️ Overdue |
| Drill #7 | sarah.lee | 2025-01-28 | 3 days | ✓ OK |

**Alert Threshold:** Tools out > 7 days = overdue

### 6.5 Cost Confidentiality

**Tool costs can be marked confidential:**
- Purchase cost visible only to users with `tools.view_cost` permission
- Other users see tool details but NOT cost
- Prevents disclosure of sensitive procurement data

### 6.6 Tools Permissions

| Permission Code | Description |
|----------------|-------------|
| `tools.view` | View tool list |
| `tools.create` | Add new tools |
| `tools.edit` | Edit tool details |
| `tools.issue` | Issue tools to users |
| `tools.return` | Return tools |
| `tools.view_cost` | View purchase cost |
| `tools.calibrate` | Record calibration |
| `tools.mark_missing` | Report missing |
| `tools.resolve_missing` | Clear missing status |

---

<a name="7-suppliers-customers"></a>
## 7. Module 5 – Suppliers & Customers

Master records for external entities.

### 7.1 Suppliers

**Purpose:** Track vendors who provide inventory, rotables, and services.

| Field | Description |
|-------|-------------|
| **Code** | Unique supplier code |
| **Name** | Company name |
| **Contact Person** | Primary contact |
| **Email** | Contact email |
| **Phone** | Contact phone |
| **Address** | Physical/mailing address |
| **Notes** | Additional information |

**Links to:**
- ✓ Inventory batches (supplier field)
- ✓ Rotables (purchase & service supplier)
- ✓ Reference documents (invoices)

### 7.2 Customers / Owners / Operators

**Purpose:** Track aircraft owners and operators for job cards.

| Field | Description |
|-------|-------------|
| **Code** | Unique customer code |
| **Name** | Company/individual name |
| **Type** | Owner, Operator, or Both |
| **Contact Person** | Primary contact |
| **Email** | Contact email |
| **Phone** | Contact phone |
| **Address** | Physical/mailing address |
| **Notes** | Additional information |

**Links to:**
- ✓ Job cards (customer field)
- ✓ Future invoicing (QuickBooks)

### 7.3 Data Relationships

```
═══════════════════════════════════════════════════════════════
               DATA RELATIONSHIP DIAGRAM
═══════════════════════════════════════════════════════════════

┌───────────┐        ┌───────────┐        ┌────────────┐
│ SUPPLIERS │──────► │ INVENTORY │──────► │ JOB CARDS  │
│           │        │  BATCHES  │        │            │
└─────┬─────┘        └─────┬─────┘        └──────┬─────┘
      │                    │                      │
      ↓                    ↓                      ↓
┌───────────┐        ┌───────────┐        ┌────────────┐
│ ROTABLES  │        │   TOOLS   │        │ CUSTOMERS  │
│ SERVICES  │        │ PURCHASES │        │   OWNERS   │
└───────────┘        └───────────┘        └────────────┘

═══════════════════════════════════════════════════════════════
```

---

<a name="8-permissions"></a>
## 8. Module 6 – User Management & Permissions

The system uses **granular, permission-based access control**.

### 8.1 Permission-Based System (Not Role-Based)

**Key Concept:** Users are NOT assigned to predefined roles like "Engineer" or "Warehouse Manager". Instead, each user is assigned **specific permissions** for each module/action.

**Benefits:**
- ✅ **Maximum Flexibility** - Any combination of permissions
- ✅ **Fine-Grained Control** - Precise control over actions
- ✅ **Easy Scaling** - Add new permissions anytime
- ✅ **No Role Limitations** - Cross-functional permissions

### 8.2 Permission Structure

**Format:** `module.action`

**Examples:**
```
inventory.view
inventory.create
inventory.approve_receipt
jobcard.create
jobcard.close
tools.issue
rotables.view_service_cost
admin.manage_users
```

### 8.3 Complete Permission List

See **Appendix A** for the complete reference of all permissions.

**Core Modules:**
- **Inventory:** 17 permissions
- **Job Cards:** 14 permissions
- **Rotables:** 10 permissions
- **Tools:** 11 permissions
- **Admin:** 10 permissions
- **Reports:** 8 permissions

**Total:** 70+ granular permissions

### 8.4 Permission Assignment

**Database Structure:**

```
Users ←→ User_Permissions ←→ Permissions
```

**Example User Configuration:**

```
User: John Smith (Engineer)
Permissions:
  ✓ inventory.view
  ✓ inventory.issue
  ✓ inventory.return
  ✓ jobcard.view
  ✓ jobcard.create
  ✓ jobcard.add_labour
  ✓ jobcard.add_parts
  ✓ tools.view
  ✓ tools.issue
  ✓ tools.return
```

### 8.5 Special User Types

| User Type | Permission Pattern |
|-----------|-------------------|
| **Super User** | `*` (all permissions) |
| **Administrator** | `admin.*` + selected modules |
| **Regular User** | Explicit list |
| **Viewer** | `*.view` only |

### 8.6 Approval Workflows

**Self-Approval Capability:**

Users with approval permissions can **auto-approve** their own actions:

| Permission | Grants Self-Approval For |
|-----------|-------------------------|
| `inventory.approve_receipt` | Can receive AND approve own receipts |
| `inventory.approve_issue` | Can issue AND approve own issues |
| `inventory.approve_adjustment` | Can adjust AND approve own adjustments |

**Example:**
```
User: warehouse.manager
Permissions: 
  - inventory.receive
  - inventory.approve_receipt  ← Self-approval enabled

Workflow:
1. User receives batch
2. System checks: Does user have approve_receipt?
3. YES → Batch auto-approved (status: APPROVED)
4. NO → Batch pending approval (status: PENDING)
```

### 8.7 On-Login Notifications

Users see **permission-based alerts** on login:

| Alert | Required Permission | Example |
|-------|---------------------|---------|
| Pending Receipts | `inventory.approve_receipt` | "5 batches awaiting approval" |
| Pending Issues | `inventory.approve_issue` | "3 issues awaiting approval" |
| Stock Expiring | `inventory.view` | "2 items expiring in 30 days" |
| Jobs to Close | `jobcard.close` | "7 jobs ready to close" |
| Overdue Rotables | `rotables.view_alerts` | "1 component overdue service" |
| Missing Tools | `tools.view` | "2 tools not returned" |

**Non-intrusive:** Shown as badge/notification, not popup.

---

<a name="9-reporting"></a>
## 9. Module 7 – Reporting & Analytics

Comprehensive reporting across all modules.

### 9.1 Stock Reports

| Report | Description | Key Data |
|--------|-------------|----------|
| **Stock Card** | Per-item history | All transactions for one product |
| **Movement Report** | Date range analysis | Receipts, issues, adjustments |
| **Stock as of Date** | Historical snapshot | Inventory at specific date |
| **Quarantined Items** | On-hold stock | Batches in quarantine |
| **WIP Reserved** | Job card allocations | Parts in open jobs |
| **Slow-Moving Stock** | Aging analysis | Items with no movement |
| **Low Stock Alert** | Reorder warnings | Below minimum levels |
| **Expiring Items** | Shelf-life tracking | Approaching expiry |

### 9.2 Job Card Reports

| Report | Description |
|--------|-------------|
| **Open Jobs** | Currently active jobs |
| **WIP Analysis** | Work in progress details |
| **Closed Jobs** | Completed jobs |
| **Parts Value in Jobs** | Stock tied up in open jobs |
| **Labour Summary** | Labour hours and costs |
| **Profitability** | Revenue vs cost analysis |

### 9.3 Rotable Reports

| Report | Description |
|--------|-------------|
| **Due for Service** | Components approaching limits |
| **Overdue Components** | Past service due date |
| **Service Cost History** | Cumulative service costs |
| **Lifecycle Summary** | Install/remove history |

### 9.4 Tool Reports

| Report | Description |
|--------|-------------|
| **Tools Issued** | Currently out |
| **Overdue Returns** | Tools out > 7 days |
| **Calibration Due** | Upcoming calibration |
| **Missing Tools** | Reported missing |

### 9.5 Analytics (Charts & Graphs)

| Chart Type | Visualization |
|-----------|---------------|
| **Pie** | Received vs Issued vs Adjusted |
| **Line** | Stock levels over time |
| **Bar** | Jobs per status (Open/WIP/Closed) |
| **Donut** | WIP vs Completed vs On Hold |

### 9.6 Reports Permissions

| Permission | Access |
|-----------|--------|
| `reports.view_stock` | Stock reports |
| `reports.view_movement` | Movement reports |
| `reports.view_jobcards` | Job card reports |
| `reports.view_financial` | Financial reports |
| `reports.export` | Export to Excel/PDF |

---

<a name="10-admin"></a>
## 10. Module 8 – Admin / Settings

System configuration and management.

### 10.1 Admin Functions

| Function | Description |
|----------|-------------|
| **System Settings** | Company info, defaults, logo |
| **User Management** | Create, edit, activate users |
| **Permission Management** | Create and assign permissions |
| **Warehouses** | Configure warehouse locations |
| **Exchange Rates** | Set default rates |
| **Barcode Settings** | QR code configuration |
| **Suppliers** | Manage supplier database |
| **Customers** | Manage customer database |
| **Audit Logs** | View system activity |

### 10.2 Permission Configuration

**Create New Permission:**
```
Module: [Dropdown: Inventory, JobCard, Tools, etc.]
Action: [Text: approve_special_case]
Description: [Text: Approve special inventory cases]
Permission Code: inventory.approve_special_case (auto-generated)

[Save Permission]
```

**Assign to User:**
```
User: John Smith
Available Permissions → Assigned Permissions

☐ inventory.view        ☑ inventory.issue
☐ inventory.create      ☑ jobcard.view
☑ inventory.receive     ☑ jobcard.create

[Save Changes]
```

### 10.3 Warehouse Configuration

| Field | Description |
|-------|-------------|
| **Code** | Unique warehouse code |
| **Name** | Warehouse name |
| **Description** | Purpose/notes |
| **Location** | Physical address |
| **Active** | Enable/disable |

**All warehouses support:**
- ✓ Fractional quantities
- ✓ Batch tracking
- ✓ Bin/rack/row locations
- ✓ Any product type

---

<a name="11-integrations"></a>
## 11. Module 9 – Future Integrations

### 11.1 Immediate Future

**QuickBooks Integration:**
- ✓ Sync invoices from closed job cards
- ✓ Link invoice numbers
- ✓ Export financial data
- ✓ Purchasing integration

### 11.2 Planned Future

- **Biometric Authentication** - Fingerprint for approvals
- **Supplier API** - Direct integration with suppliers
- **SMS/Email Alerts** - Automated notifications
- **Cloud Backup** - MySQL mirroring to cloud

---

<a name="12-data-flow"></a>
## 12. Data Flow & System Behaviour

### 12.1 High-Level Data Flow

```
═══════════════════════════════════════════════════════════════
                    HIGH-LEVEL DATA FLOW
═══════════════════════════════════════════════════════════════

                   ┌────────────┐
                   │ SUPPLIERS  │
                   └──────┬─────┘
                          ↓
                ┌──────────────────┐
                │    INVENTORY     │
                │  (Batch Engine)  │
                └────────┬─────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
 ┌────────────┐   ┌────────────┐   ┌───────────┐
 │ JOB CARDS  │   │   TOOLS    │   │ ROTABLES  │
 └──────┬─────┘   └──────┬─────┘   └─────┬─────┘
        │                │                │
        │                └────────┬───────┘
        ↓                         ↓
 ┌────────────┐          ┌──────────────┐
 │ CUSTOMERS  │          │  REPORTING & │
 └────────────┘          │  ANALYTICS   │
                         └──────┬───────┘
                                ↓
                        ┌───────────────┐
                        │  PERMISSIONS  │
                        │    CONTROL    │
                        └───────────────┘

═══════════════════════════════════════════════════════════════
```

### 12.2 Core Philosophy

**Station-2100 runs on a single philosophy:**

> **Trace every component, every batch, every tool, every job, every issue, every approval, every user action — all the way from purchase to final job closure — with full history, auditability, and flexibility.**

### 12.3 Key Principles

1. **Transaction-Driven** - Every action creates an audit trail
2. **Permission-Controlled** - Granular permissions govern all operations
3. **Batch-Centric** - All stock tracked by batch with full traceability
4. **Approval-Based** - Critical actions require authorization
5. **Historically Accurate** - Reconstruct state at any point in time
6. **Aviation Compliant** - Built for regulatory requirements

---

<a name="13-quick-reference"></a>
## 13. Quick Reference

### 13.1 Module Summary

| Module | Scope | Key Feature |
|--------|-------|-------------|
| **Inventory** | Stock management | Batch-based with historical tracking |
| **Job Cards** | Work orders | 4 tabs (Main/Consumables/Owner/Labour) |
| **Rotables** | Serialized parts | Lifecycle with service intervals |
| **Tools** | Portable equipment | Issue/return with calibration |
| **Suppliers/Customers** | Master data | External entities |
| **Permissions** | Access control | Granular 70+ permissions |
| **Reports** | Analytics | Historical + real-time |
| **Admin** | Configuration | System settings |
| **Integrations** | External systems | QuickBooks (future) |

### 13.2 Permission Examples

**Junior Engineer:**
```
inventory.view, inventory.issue, inventory.return
jobcard.view, jobcard.create, jobcard.add_labour, jobcard.add_parts
tools.view, tools.issue, tools.return
```

**Warehouse Manager:**
```
inventory.* (all inventory permissions)
jobcard.view, jobcard.view_cost
reports.view_stock, reports.view_movement
```

**Finance Manager:**
```
inventory.view_cost
jobcard.view_cost, jobcard.view_profit
reports.view_financial
```

**Super Administrator:**
```
* (all permissions)
```

### 13.3 System Capabilities

| Feature | Status |
|---------|--------|
| Batch-based inventory | ✅ Core feature |
| Fractional quantities | ✅ All warehouses |
| Historical reconstruction | ✅ Any date query |
| 4-tab job cards | ✅ Main/Consumables/Owner/Labour |
| Issued by / Received by | ✅ Full traceability |
| WIP stock visibility | ✅ Reserved stock tracking |
| Barcode/QR support | ✅ Generate & scan |
| Exchange rate override | ✅ User overrideable |
| Self-approval | ✅ Permission-based |
| Audit trails | ✅ Complete logging |
| QuickBooks integration | 🔜 Future |

---

## Appendix A: Complete Permission Reference

### Inventory Module (17 Permissions)
```
inventory.view                  - View inventory and batches
inventory.create                - Create product records
inventory.edit                  - Edit product details
inventory.delete                - Delete products
inventory.receive               - Receive new batches
inventory.approve_receipt       - Approve received batches
inventory.issue                 - Issue stock
inventory.approve_issue         - Approve stock issues
inventory.adjust                - Create adjustments
inventory.approve_adjustment    - Approve adjustments
inventory.return                - Return stock
inventory.approve_return        - Approve returns
inventory.quarantine            - Place on hold
inventory.view_cost             - View cost data
inventory.edit_pricing          - Modify prices
inventory.view_supplier         - View supplier info
inventory.manage_locations      - Manage bin/rack/row
```

### Job Card Module (14 Permissions)
```
jobcard.view                - View job cards
jobcard.create              - Create jobs
jobcard.edit                - Edit job details
jobcard.delete              - Delete jobs
jobcard.add_labour          - Add labour entries
jobcard.edit_labour         - Edit labour
jobcard.add_parts           - Add parts
jobcard.remove_parts        - Remove parts
jobcard.close               - Close jobs
jobcard.reopen              - Reopen closed jobs
jobcard.view_cost           - View costs
jobcard.edit_invoice        - Edit invoice number
jobcard.print               - Print job cards
jobcard.view_profit         - View profitability
```

### Rotables Module (10 Permissions)
```
rotables.view                  - View rotables
rotables.create                - Add rotables
rotables.edit                  - Edit details
rotables.delete                - Delete rotables
rotables.install               - Mark installed
rotables.remove                - Mark removed
rotables.service               - Record service
rotables.view_service_cost     - View service costs
rotables.edit_service_cost     - Edit service costs
rotables.view_alerts           - View overdue alerts
```

### Tools Module (11 Permissions)
```
tools.view                  - View tools
tools.create                - Add tools
tools.edit                  - Edit details
tools.delete                - Delete tools
tools.issue                 - Issue tools
tools.return                - Return tools
tools.view_cost             - View purchase cost
tools.calibrate             - Record calibration
tools.view_calibration      - View calibration dates
tools.mark_missing          - Report missing
tools.resolve_missing       - Clear missing status
```

### Admin Module (10 Permissions)
```
admin.view_settings         - View settings
admin.edit_settings         - Modify settings
admin.manage_users          - Manage users
admin.manage_permissions    - Assign permissions
admin.manage_warehouses     - Configure warehouses
admin.manage_suppliers      - Manage suppliers
admin.manage_customers      - Manage customers
admin.view_audit_logs       - View audit logs
admin.export_data           - Export data
admin.backup_restore        - Backup/restore
```

### Reports Module (8 Permissions)
```
reports.view_stock          - Stock reports
reports.view_movement       - Movement reports
reports.view_jobcards       - Job card reports
reports.view_financial      - Financial reports
reports.view_rotables       - Rotable reports
reports.view_tools          - Tool reports
reports.export              - Export reports
reports.schedule            - Schedule reports
```

---

**End of Complete Technical Specification**

*Station-2100 - Aviation Maintenance & Inventory Management System*  
*Version 2.0 - December 2025*
