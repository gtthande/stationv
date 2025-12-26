--
-- MySQL schema for Station‑2100
--

-- SECURITY / RBAC ---------------------------------------------------------

CREATE TABLE users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(100) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  full_name     VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roles (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE permissions (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE role_permissions (
  role_id       BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MASTER DATA -------------------------------------------------------------

CREATE TABLE warehouses (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(150) NOT NULL,
  code       VARCHAR(50) NOT NULL UNIQUE,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE locations (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  bin_code     VARCHAR(50) NULL,
  rack_code    VARCHAR(50) NULL,
  row_code     VARCHAR(50) NULL,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT fk_locations_warehouse
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suppliers (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(255) NOT NULL,
  code           VARCHAR(100) NULL UNIQUE,
  contact_person VARCHAR(255) NULL,
  email          VARCHAR(255) NULL,
  phone          VARCHAR(100) NULL,
  address        TEXT NULL,
  notes          TEXT NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customers (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(255) NOT NULL,
  code           VARCHAR(100) NULL UNIQUE,
  contact_person VARCHAR(255) NULL,
  email          VARCHAR(255) NULL,
  phone          VARCHAR(100) NULL,
  address        TEXT NULL,
  notes          TEXT NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  part_number            VARCHAR(150) NOT NULL,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT NULL,
  unit_of_measure        VARCHAR(20) NOT NULL,
  default_markup_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  is_serialized          TINYINT(1) NOT NULL DEFAULT 0,
  is_consumable          TINYINT(1) NOT NULL DEFAULT 0,
  is_owner_supplied_allowed TINYINT(1) NOT NULL DEFAULT 1,
  min_stock_level        DECIMAL(18,4) NULL,
  max_stock_level        DECIMAL(18,4) NULL,
  is_active              TINYINT(1) NOT NULL DEFAULT 1,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_part_number (part_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_images (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id  BIGINT UNSIGNED NOT NULL,
  type        ENUM('TECHNICAL','APPEARANCE') NOT NULL,
  image_url   VARCHAR(1000) NOT NULL,
  is_primary  TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stock_adjustment_reasons (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INVENTORY CORE ----------------------------------------------------------

CREATE TABLE batches (
  id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id              BIGINT UNSIGNED NOT NULL,
  warehouse_id            BIGINT UNSIGNED NOT NULL,
  location_id             BIGINT UNSIGNED NULL,
  batch_code              VARCHAR(150) NOT NULL UNIQUE,
  supplier_id             BIGINT UNSIGNED NULL,
  reference_doc           VARCHAR(255) NULL,
  received_quantity       DECIMAL(18,4) NOT NULL,
  remaining_quantity      DECIMAL(18,4) NOT NULL,
  currency                VARCHAR(10) NOT NULL DEFAULT 'USD',
  fx_rate                 DECIMAL(18,6) NOT NULL DEFAULT 1.000000,
  landed_cost_per_unit    DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  fitting_price_per_unit  DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  status                  ENUM('PENDING','APPROVED','QUARANTINED','DEPLETED') NOT NULL DEFAULT 'PENDING',
  expiry_date             DATE NULL,
  received_by             BIGINT UNSIGNED NOT NULL,
  approved_by             BIGINT UNSIGNED NULL,
  received_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at             DATETIME NULL,
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_batches_product (product_id),
  KEY idx_batches_warehouse (warehouse_id),
  CONSTRAINT fk_batches_product
    FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_batches_warehouse
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_batches_location
    FOREIGN KEY (location_id) REFERENCES locations(id),
  CONSTRAINT fk_batches_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  CONSTRAINT fk_batches_received_by
    FOREIGN KEY (received_by) REFERENCES users(id),
  CONSTRAINT fk_batches_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- JOB CARDS --------------------------------------------------------------

CREATE TABLE job_cards (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_number     VARCHAR(100) NOT NULL UNIQUE,
  customer_id    BIGINT UNSIGNED NOT NULL,
  aircraft_reg   VARCHAR(100) NULL,
  asset_identifier VARCHAR(150) NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT NULL,
  status         ENUM('OPEN','IN_PROGRESS','AWAITING_APPROVAL','CLOSED') NOT NULL DEFAULT 'OPEN',
  owner_reference VARCHAR(150) NULL,
  invoice_number VARCHAR(150) NULL,
  opened_by      BIGINT UNSIGNED NOT NULL,
  closed_by      BIGINT UNSIGNED NULL,
  opened_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at      DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_job_cards_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_job_cards_opened_by
    FOREIGN KEY (opened_by) REFERENCES users(id),
  CONSTRAINT fk_job_cards_closed_by
    FOREIGN KEY (closed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE job_card_labour (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_card_id      BIGINT UNSIGNED NOT NULL,
  engineer_id      BIGINT UNSIGNED NOT NULL,
  labour_code      VARCHAR(100) NULL,
  description      TEXT NOT NULL,
  hours            DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  rate_per_hour    DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  total_cost_local DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_job_card_labour_job_card
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
  CONSTRAINT fk_job_card_labour_engineer
    FOREIGN KEY (engineer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE job_card_parts (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_card_id        BIGINT UNSIGNED NOT NULL,
  source_type        ENUM('MAIN_WAREHOUSE','CONSUMABLE','OWNER_SUPPLIED') NOT NULL,
  batch_id           BIGINT UNSIGNED NULL,
  product_id         BIGINT UNSIGNED NULL,
  description_override TEXT NULL,
  quantity           DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  unit_cost_local    DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  unit_price_local   DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  total_cost_local   DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  total_price_local  DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  is_owner_supplied  TINYINT(1) NOT NULL DEFAULT 0,
  issued_by          BIGINT UNSIGNED NULL,
  received_by        BIGINT UNSIGNED NULL,
  line_order         INT NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_job_card_parts_job_card (job_card_id),
  CONSTRAINT fk_job_card_parts_job_card
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
  CONSTRAINT fk_job_card_parts_batch
    FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_job_card_parts_product
    FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_job_card_parts_issued_by
    FOREIGN KEY (issued_by) REFERENCES users(id),
  CONSTRAINT fk_job_card_parts_received_by
    FOREIGN KEY (received_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INVENTORY TRANSACTIONS --------------------------------------------------

CREATE TABLE inventory_transactions (
  id                         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  batch_id                   BIGINT UNSIGNED NOT NULL,
  transaction_type           ENUM('RECEIPT','ISSUE','ADJUSTMENT','TRANSFER') NOT NULL,
  direction                  ENUM('IN','OUT') NOT NULL,
  quantity                   DECIMAL(18,4) NOT NULL,
  unit_cost_local            DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  total_cost_local           DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  job_card_part_id           BIGINT UNSIGNED NULL,
  from_warehouse_id          BIGINT UNSIGNED NULL,
  to_warehouse_id            BIGINT UNSIGNED NULL,
  stock_adjustment_reason_id BIGINT UNSIGNED NULL,
  created_by                 BIGINT UNSIGNED NOT NULL,
  approved_by                BIGINT UNSIGNED NULL,
  status                     ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  notes                      TEXT NULL,
  transaction_date           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inv_tx_batch (batch_id),
  KEY idx_inv_tx_date_status (transaction_date, status),
  CONSTRAINT fk_inv_tx_batch
    FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_inv_tx_job_card_part
    FOREIGN KEY (job_card_part_id) REFERENCES job_card_parts(id),
  CONSTRAINT fk_inv_tx_from_warehouse
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_inv_tx_to_warehouse
    FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_inv_tx_reason
    FOREIGN KEY (stock_adjustment_reason_id) REFERENCES stock_adjustment_reasons(id),
  CONSTRAINT fk_inv_tx_created_by
    FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_inv_tx_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;