-- Clean null bytes from users table
-- This script removes null bytes that cause UTF-8 encoding errors
-- Run this with: psql -d your_database -f clean_nulls.sql

-- Alternative 1: Clean using encode/decode to work around PostgreSQL restrictions
UPDATE users 
SET name = decode(regexp_replace(encode(name::bytea, 'hex'), '00', '', 'g'), 'hex')::text;

UPDATE users 
SET city = decode(regexp_replace(encode(city::bytea, 'hex'), '00', '', 'g'), 'hex')::text;

UPDATE users 
SET email = decode(regexp_replace(encode(email::bytea, 'hex'), '00', '', 'g'), 'hex')::text;

UPDATE users 
SET gender = decode(regexp_replace(encode(gender::bytea, 'hex'), '00', '', 'g'), 'hex')::text;

-- Verify the cleanup - count any remaining null bytes
SELECT COUNT(*) as total_users, 
       SUM(CASE WHEN position(E'\\000' in name) > 0 THEN 1 ELSE 0 END) as name_nulls,
       SUM(CASE WHEN position(E'\\000' in city) > 0 THEN 1 ELSE 0 END) as city_nulls,
       SUM(CASE WHEN position(E'\\000' in email) > 0 THEN 1 ELSE 0 END) as email_nulls,
       SUM(CASE WHEN position(E'\\000' in gender) > 0 THEN 1 ELSE 0 END) as gender_nulls
FROM users;
