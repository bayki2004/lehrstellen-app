-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE education_type AS ENUM ('EFZ', 'EBA');
CREATE TYPE lehrstelle_status AS ENUM ('active', 'filled', 'expired');
CREATE TYPE swipe_direction AS ENUM ('right', 'left', 'super_like');
CREATE TYPE match_status AS ENUM ('active', 'archived', 'hired');
CREATE TYPE sender_type AS ENUM ('student', 'company', 'system');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'system');
CREATE TYPE consent_status AS ENUM ('pending', 'granted', 'revoked');
CREATE TYPE video_generation_status AS ENUM ('pending', 'generating_script', 'script_ready', 'processing', 'completed', 'failed');
CREATE TYPE company_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE app_language AS ENUM ('de', 'fr', 'it');
