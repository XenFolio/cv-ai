/*
  # Create documents table for CV library

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `doc_type` (text) - cv or letter
      - `name` (text) - Document name
      - `type` (text) - analyzed or created
      - `ats_score` (integer) - ATS compatibility score
      - `status` (text) - draft, completed, optimized
      - `template` (text) - Template name if created
      - `industry` (text) - Industry sector
      - `is_favorite` (boolean) - Favorite flag
      - `file_size` (text) - File size string
      - `version` (integer) - Document version
      - `content` (text) - Document content or description
      - `original_file_name` (text) - Original file name
      - `original_file_data` (bytea) - Original file binary data
      - `analysis_results` (jsonb) - Analysis results from OpenAI
      - `cv_data` (jsonb) - CV creation data
      - `metadata` (jsonb) - Additional metadata
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `documents` table
    - Add policies for users to manage their own documents
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('cv', 'letter')),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('analyzed', 'created')),
  ats_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'optimized')),
  template text,
  industry text NOT NULL DEFAULT 'Non spécifié',
  is_favorite boolean NOT NULL DEFAULT false,
  file_size text NOT NULL DEFAULT 'Inconnu',
  version integer NOT NULL DEFAULT 1,
  content text,
  original_file_name text,
  original_file_data bytea,
  analysis_results jsonb DEFAULT '{}',
  cv_data jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can read their own documents
CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own documents
CREATE POLICY "Users can create own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS documents_user_id_created_at_idx 
  ON documents(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS documents_user_id_type_idx 
  ON documents(user_id, type);

CREATE INDEX IF NOT EXISTS documents_user_id_favorites_idx 
  ON documents(user_id, is_favorite) WHERE is_favorite = true;

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();
