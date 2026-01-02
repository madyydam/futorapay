-- FIX ACCOUNT TYPE CONSTRAINT
-- The frontend allows 'other_asset' and 'other_liability', but the database constraint is missing them.
-- This script updates the check constraint to include all frontend types.

ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check;

ALTER TABLE accounts ADD CONSTRAINT accounts_type_check CHECK (type IN (
    'cash',
    'bank_checking',
    'bank_savings',
    'credit_card',
    'investment',
    'loan',
    'mortgage',
    'real_estate',
    'crypto',
    'other_asset',
    'other_liability'
));
