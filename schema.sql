-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (useful for re-running)
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. Create users table (Extends Supabase auth.users indirectly or maps to it)
-- Note: id should reference auth.users(id) if you map to true supabase auth, 
-- but for simplicity we'll just set it up exactly as requested.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    ubicacio VARCHAR(100),
    valoracio_mitjana DECIMAL(2,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    descripcio TEXT
);

-- 3. Create books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    venedor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES categories(id),
    titol VARCHAR(255) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    idioma VARCHAR(50) NOT NULL,
    estat VARCHAR(20) NOT NULL CHECK (estat IN ('nou', 'com_a_nou', 'bon_estat', 'acceptable')),
    preu DECIMAL(6,2) NOT NULL,
    foto_url TEXT,
    descripcio TEXT,
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - Required for Supabase standard setup
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories and books
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on books" ON books FOR SELECT USING (true);

-- Users can read all users (to see venedor details)
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);

-- (If needed) insert policies would go here for V2 like:
-- CREATE POLICY "Users can insert their own books" ON books FOR INSERT WITH CHECK (auth.uid() = venedor_id);
