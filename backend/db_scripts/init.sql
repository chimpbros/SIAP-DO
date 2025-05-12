-- Enable pgcrypto extension if not already enabled (for gen_random_uuid() and crypt())
-- This needs to be run first.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    pangkat VARCHAR(255) NOT NULL,
    nrp VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    registration_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipe_surat VARCHAR(50) NOT NULL, -- e.g., 'Surat Masuk', 'Surat Keluar'
    jenis_surat VARCHAR(50) NOT NULL, -- e.g., 'ST', 'STR', 'Biasa', 'Sprin', 'Nota Dinas'
    nomor_surat VARCHAR(255) NOT NULL,
    perihal TEXT NOT NULL,
    pengirim VARCHAR(255), -- NULLABLE, only for 'Surat Masuk'
    isi_disposisi TEXT, -- NULLABLE, only for 'Surat Masuk'
    storage_path VARCHAR(255) NOT NULL, -- Path to the file on the server's filesystem
    original_filename VARCHAR(255) NOT NULL,
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploader_user_id UUID NOT NULL REFERENCES users(user_id),
    month_year VARCHAR(7) NOT NULL -- e.g., '2025-05' for easier filtering/grouping
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_documents_nomor_surat ON documents(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_documents_tipe_surat ON documents(tipe_surat);
CREATE INDEX IF NOT EXISTS idx_documents_jenis_surat ON documents(jenis_surat);
CREATE INDEX IF NOT EXISTS idx_documents_month_year ON documents(month_year);
CREATE INDEX IF NOT EXISTS idx_documents_uploader_user_id ON documents(uploader_user_id);

-- Add comments to columns
COMMENT ON COLUMN documents.tipe_surat IS 'e.g., ''Surat Masuk'', ''Surat Keluar''';
COMMENT ON COLUMN documents.jenis_surat IS 'e.g., ''ST'', ''STR'', ''Biasa'', ''Sprin'', ''Nota Dinas''';
COMMENT ON COLUMN documents.pengirim IS 'NULLABLE, only for ''Surat Masuk''';
COMMENT ON COLUMN documents.isi_disposisi IS 'NULLABLE, only for ''Surat Masuk''';
COMMENT ON COLUMN documents.storage_path IS 'Path to the file on the server''s filesystem';
COMMENT ON COLUMN documents.month_year IS 'e.g., ''2025-05'' for easier filtering/grouping';
