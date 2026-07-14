-- Existing translation uploads were stored under the role labels while the
-- underlying Manufacturer and Importer questionnaire files were reversed.
-- Move the payloads with their actual questionnaire content so custom
-- translations remain aligned after correcting the role mapping.

UPDATE "TeamData"
SET "dataKey" = regexp_replace(
  "dataKey",
  '^compliance:translation:team-manufacturer:',
  'compliance:translation:__swap-team-manufacturer:'
)
WHERE "dataKey" LIKE 'compliance:translation:team-manufacturer:%';

UPDATE "TeamData"
SET "dataKey" = regexp_replace(
  "dataKey",
  '^compliance:translation:team-importer:',
  'compliance:translation:team-manufacturer:'
)
WHERE "dataKey" LIKE 'compliance:translation:team-importer:%';

UPDATE "TeamData"
SET "dataKey" = regexp_replace(
  "dataKey",
  '^compliance:translation:__swap-team-manufacturer:',
  'compliance:translation:team-importer:'
)
WHERE "dataKey" LIKE 'compliance:translation:__swap-team-manufacturer:%';

UPDATE "TeamData"
SET "dataKey" = regexp_replace(
  "dataKey",
  '^compliance:translation:version-manufacturer:',
  'compliance:translation:__swap-version-manufacturer:'
)
WHERE "dataKey" LIKE 'compliance:translation:version-manufacturer:%';

UPDATE "TeamData"
SET "dataKey" = regexp_replace(
  "dataKey",
  '^compliance:translation:version-importer:',
  'compliance:translation:version-manufacturer:'
)
WHERE "dataKey" LIKE 'compliance:translation:version-importer:%';

UPDATE "TeamData"
SET "dataKey" = regexp_replace(
  "dataKey",
  '^compliance:translation:__swap-version-manufacturer:',
  'compliance:translation:version-importer:'
)
WHERE "dataKey" LIKE 'compliance:translation:__swap-version-manufacturer:%';
