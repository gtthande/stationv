/**
 * TypeScript interfaces representing the core tables in Station‑2100.  These
 * mirror the columns defined in `sql/schema.sql` and can be used throughout
 * your application for type safety.  Feel free to extend or refine as
 * necessary.
 */

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  password_hash: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
}

export interface Permission {
  id: number;
  code: string;
  description?: string | null;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  warehouse_id: number;
  bin_code?: string | null;
  rack_code?: string | null;
  row_code?: string | null;
  is_active: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  code?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  code?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  part_number: string;
  name: string;
  description?: string | null;
  unit_of_measure: string;
  default_markup_percent: number;
  is_serialized: boolean;
  is_consumable: boolean;
  is_owner_supplied_allowed: boolean;
  min_stock_level?: number | null;
  max_stock_level?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: number;
  product_id: number;
  warehouse_id: number;
  location_id?: number | null;
  batch_code: string;
  supplier_id?: number | null;
  reference_doc?: string | null;
  received_quantity: number;
  remaining_quantity: number;
  currency: string;
  fx_rate: number;
  landed_cost_per_unit: number;
  fitting_price_per_unit: number;
  status: 'PENDING' | 'APPROVED' | 'QUARANTINED' | 'DEPLETED';
  expiry_date?: string | null;
  received_by: number;
  approved_by?: number | null;
  received_at: string;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobCard {
  id: number;
  job_number: string;
  customer_id: number;
  aircraft_reg?: string | null;
  asset_identifier?: string | null;
  title: string;
  description?: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_APPROVAL' | 'CLOSED';
  owner_reference?: string | null;
  invoice_number?: string | null;
  opened_by: number;
  closed_by?: number | null;
  opened_at: string;
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobCardLabour {
  id: number;
  job_card_id: number;
  engineer_id: number;
  labour_code?: string | null;
  description: string;
  hours: number;
  rate_per_hour: number;
  total_cost_local: number;
  created_at: string;
  updated_at: string;
}

export interface JobCardPart {
  id: number;
  job_card_id: number;
  source_type: 'MAIN_WAREHOUSE' | 'CONSUMABLE' | 'OWNER_SUPPLIED';
  batch_id?: number | null;
  product_id?: number | null;
  description_override?: string | null;
  quantity: number;
  unit_cost_local: number;
  unit_price_local: number;
  total_cost_local: number;
  total_price_local: number;
  is_owner_supplied: boolean;
  issued_by?: number | null;
  received_by?: number | null;
  line_order: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: number;
  batch_id: number;
  transaction_type: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER';
  direction: 'IN' | 'OUT';
  quantity: number;
  unit_cost_local: number;
  total_cost_local: number;
  job_card_part_id?: number | null;
  from_warehouse_id?: number | null;
  to_warehouse_id?: number | null;
  stock_adjustment_reason_id?: number | null;
  created_by: number;
  approved_by?: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}