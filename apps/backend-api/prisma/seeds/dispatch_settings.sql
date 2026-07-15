-- Migration: Insert Smart Dispatch System Settings into SystemSetting table
-- Run on VPS: psql $DATABASE_URL -f prisma/seeds/dispatch_settings.sql

INSERT INTO "SystemSetting" (key, value, description, "updatedAt")
VALUES
  ('search_radius_km',         '5',   'Dispatch search radius in kilometres',                                NOW()),
  ('premier_priority_duration','3',   'Seconds to hold ride offer exclusively for Premier drivers',          NOW()),
  ('premier_weekly_target',    '30',  'Weekly completed rides required to earn/keep Premier status',         NOW()),
  ('silver_commission',        '8.4', 'Commission rate (%) for Silver-tier drivers (0-2 total rides)',       NOW()),
  ('gold_commission',          '8.4', 'Commission rate (%) for Gold-tier drivers (≥3 total rides)',          NOW()),
  ('premier_commission',       '8.4', 'Commission rate (%) for Premier-tier drivers (≥30 rides this week)', NOW()),
  ('priority_enabled',         'true','Enable priority dispatch window for Premier drivers',                  NOW())
ON CONFLICT (key) DO UPDATE
  SET value       = EXCLUDED.value,
      description = EXCLUDED.description,
      "updatedAt" = NOW();
