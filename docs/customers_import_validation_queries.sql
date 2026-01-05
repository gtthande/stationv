-- Pre-Import Validation Queries for Customers Import
-- Date: 2025-01-06
-- Purpose: Validate data before import execution

-- ============================================
-- 1. ROW COUNT VALIDATION
-- ============================================

-- Count total records in import file (expected: ~199)
-- Run this on the SQL file itself or count manually
-- Expected: 199 customer records

-- Count existing records in database (before import)
SELECT COUNT(*) AS existing_customer_count FROM customers;

-- ============================================
-- 2. NULL DISTRIBUTION ANALYSIS
-- ============================================

-- Check NULL distribution for key optional fields
SELECT 
    COUNT(*) AS total_records,
    COUNT(email) AS email_count,
    COUNT(phone) AS phone_count,
    COUNT(address) AS address_count,
    COUNT(city) AS city_count,
    COUNT(contact_person) AS contact_person_count,
    COUNT(aircraft_type) AS aircraft_type_count,
    COUNT(tail_number) AS tail_number_count
FROM customers;

-- Expected distribution (based on analysis):
-- email: ~5 records (2.5%)
-- phone: ~40 records (20%)
-- address: ~10 records (5%)
-- city: ~10 records (5%)
-- contact_person: ~30 records (15%)
-- aircraft_type: ~4 records (2%)
-- tail_number: ~4 records (2%)

-- ============================================
-- 3. UNIQUE FIELD VALIDATION
-- ============================================

-- Check for duplicate IDs (should be 0)
SELECT id, COUNT(*) AS duplicate_count
FROM customers
GROUP BY id
HAVING COUNT(*) > 1;

-- Check for duplicate emails (if any)
SELECT email, COUNT(*) AS duplicate_count
FROM customers
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- ============================================
-- 4. DATA TYPE VALIDATION
-- ============================================

-- Check phone number lengths (should all be <= 50 after schema update)
SELECT 
    id,
    name,
    phone,
    LENGTH(phone) AS phone_length
FROM customers
WHERE phone IS NOT NULL
ORDER BY LENGTH(phone) DESC
LIMIT 10;

-- Check for invalid UUIDs in id field
SELECT id, name
FROM customers
WHERE LENGTH(id) != 36 OR id NOT REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- ============================================
-- 5. FOREIGN KEY VALIDATION
-- ============================================

-- Check that all user_id values exist in users table
SELECT DISTINCT c.user_id
FROM customers c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Expected: All user_ids should exist (or be the same UUID: 'd541f75c-eb0c-47c4-a1be-9b4b5a448ecd')

-- ============================================
-- 6. TIMESTAMP VALIDATION
-- ============================================

-- Check timestamp format (should all be valid DATETIME)
SELECT 
    id,
    name,
    created_at,
    updated_at
FROM customers
WHERE created_at IS NULL OR updated_at IS NULL
   OR created_at < '2020-01-01' OR created_at > '2030-01-01'
   OR updated_at < '2020-01-01' OR updated_at > '2030-01-01'
LIMIT 10;

-- ============================================
-- 7. POST-IMPORT VALIDATION
-- ============================================

-- After import, verify total count matches expected
SELECT COUNT(*) AS total_imported FROM customers;
-- Expected: 199 (or existing count + 199 if INSERT IGNORE skips duplicates)

-- Verify no data corruption
SELECT 
    COUNT(*) AS total,
    COUNT(DISTINCT id) AS unique_ids,
    COUNT(DISTINCT name) AS unique_names
FROM customers;

-- Check for empty strings (should be converted to NULL)
SELECT id, name, email, phone
FROM customers
WHERE email = '' OR phone = '' OR address = '' OR city = ''
LIMIT 10;

-- ============================================
-- 8. SAMPLE DATA VERIFICATION
-- ============================================

-- Sample a few records to verify data integrity
SELECT 
    id,
    name,
    email,
    phone,
    country,
    created_at
FROM customers
ORDER BY created_at DESC
LIMIT 5;

