-- Migration: Insert Smart Dispatch System Settings into SystemSetting table
-- Run on VPS: psql $DATABASE_URL -f prisma/seeds/dispatch_settings.sql

INSERT INTO "SystemSetting" (key, value, description, "updatedAt")
VALUES
  ('search_radius_km',         '5',  'Dispatch search radius in kilometres',                        NOW()),
  ('premier_priority_duration','3',  'Seconds to hold ride offer exclusively for Premier drivers',  NOW()),
  ('silver_commission',        '15', 'Commission rate (%) for Silver-tier drivers',                 NOW()),
  ('gold_commission',          '10', 'Commission rate (%) for Gold-tier drivers',                   NOW()),
  ('premier_commission',       '8',  'Commission rate (%) for Premier-tier drivers',                NOW()),
  ('priority_enabled',         'true','Enable priority matching for Premier drivers',               NOW())
ON CONFLICT (key) DO UPDATE
  SET value       = EXCLUDED.value,
      description = EXCLUDED.description,
      "updatedAt" = NOW();
