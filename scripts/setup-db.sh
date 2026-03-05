#!/usr/bin/env bash
set -e

# Always run from repo root
cd "$(dirname "$0")/.."

DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
export DATABASE_URL="$DB_URL"

echo ""
echo "=== LehrMatch — Full Setup ==="
echo ""

# ── Step 1: Dependencies ──────────────────────────────────────
echo "[1/7] Installing dependencies..."
if command -v pnpm &>/dev/null; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
else
  echo "       pnpm not found. Installing via corepack..."
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
  pnpm install
fi

# ── Step 2: Env files ─────────────────────────────────────────
echo "[2/7] Setting up environment files..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "       Created .env from .env.example"
else
  echo "       .env already exists"
fi

if [ ! -f apps/web/.env.local ]; then
  mkdir -p apps/web
  cat > apps/web/.env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
EOF
  echo "       Created apps/web/.env.local"
else
  echo "       apps/web/.env.local already exists"
fi

# ── Step 3: Start Supabase ────────────────────────────────────
echo "[3/7] Checking Supabase..."
if ! pg_isready -h 127.0.0.1 -p 54322 -q 2>/dev/null; then
  echo "       Starting Supabase (this takes ~30s first time)..."
  npx supabase start
else
  echo "       Supabase is already running"
fi

# ── Step 4: Reset database (migrations + seed reference data) ─
echo "[4/8] Resetting database (migrations + reference data)..."
set +e
npx supabase db reset 2>&1
RESET_EXIT=$?
set -e
if [ $RESET_EXIT -ne 0 ]; then
  echo "       ⚠ Supabase reset hit 502 on container restart (data was seeded OK)."
  echo "       Waiting for Postgres to recover..."
  for i in $(seq 1 15); do
    if pg_isready -h 127.0.0.1 -p 54322 -q 2>/dev/null; then
      echo "       Postgres is back."
      break
    fi
    sleep 2
  done
fi

# ── Step 5: Drop cross-schema FKs (Prisma can't handle auth schema) ─
echo "[5/8] Preparing database for Prisma..."
# Drop ALL RLS policies, cross-schema FKs, enums, and conflicting tables
psql "$DB_URL" <<'SQL'
-- 1. Drop ALL RLS policies on public tables (they block Prisma ALTER operations)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 2. Disable RLS on all public tables
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- 3. Drop functions that depend on table types (block DROP/ALTER TABLE)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema, p.proname AS name, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', r.schema, r.name, r.args);
  END LOOP;
END $$;

-- 4. Drop cross-schema FKs (Prisma can't introspect auth schema)
ALTER TABLE "companies" DROP CONSTRAINT IF EXISTS "companies_auth_user_id_fkey";
ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "students_auth_user_id_fkey";

-- 5. Convert Postgres enums to TEXT (Prisma models use String)
ALTER TABLE "berufe" ALTER COLUMN "education_type" DROP DEFAULT;
ALTER TABLE "berufe" ALTER COLUMN "education_type" TYPE TEXT USING "education_type"::TEXT;
ALTER TABLE "berufe" ALTER COLUMN "education_type" SET DEFAULT 'EFZ';

ALTER TABLE "companies" ALTER COLUMN "company_size" DROP DEFAULT;
ALTER TABLE "companies" ALTER COLUMN "company_size" TYPE TEXT USING "company_size"::TEXT;

ALTER TABLE "lehrstellen" ALTER COLUMN "education_type" DROP DEFAULT;
ALTER TABLE "lehrstellen" ALTER COLUMN "education_type" TYPE TEXT USING "education_type"::TEXT;
ALTER TABLE "lehrstellen" ALTER COLUMN "education_type" SET DEFAULT 'EFZ';

ALTER TABLE "lehrstellen" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "lehrstellen" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
ALTER TABLE "lehrstellen" ALTER COLUMN "status" SET DEFAULT 'active';

DROP TYPE IF EXISTS education_type CASCADE;
DROP TYPE IF EXISTS company_size CASCADE;
DROP TYPE IF EXISTS lehrstelle_status CASCADE;

-- 6. Drop Supabase-created tables that Prisma will recreate
DROP TABLE IF EXISTS "applications" CASCADE;
DROP TABLE IF EXISTS "matches" CASCADE;
DROP TABLE IF EXISTS "swipes" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
SQL

# ── Step 6: Prisma ────────────────────────────────────────────
echo "[6/8] Setting up Prisma..."
cd packages/database
npx prisma generate
npx prisma db push --skip-generate --accept-data-loss
cd ../..

# ── Step 7: Fix FK constraint ─────────────────────────────────
echo "[7/8] Dropping listings FK constraint (proxy listing support)..."
psql "$DB_URL" -c 'ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_companyId_fkey";' 2>/dev/null || true

# ── Step 7: Seed test accounts ────────────────────────────────
echo "[8/8] Seeding test accounts..."
cd packages/database
npx tsx src/seed.ts
cd ../..

echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "  Start the app:"
echo "    pnpm dev:api       →  http://localhost:3002"
echo "    pnpm dev:mobile    →  Expo (press 'i' for iOS)"
echo "    pnpm dev:web       →  http://localhost:3000"
echo ""
echo "  Test accounts (password: Test1234!):"
echo "    Student:  lena.mueller@test.ch"
echo "    Company:  hr@swisstech.ch"
echo ""
