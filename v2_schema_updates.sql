-- Create orders table for BookLoop V2
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    comprador_id UUID NOT NULL REFERENCES users(id),
    book_id INT NOT NULL REFERENCES books(id),
    estat VARCHAR(20) DEFAULT 'pendent' CHECK (estat IN ('pendent', 'enviat', 'rebut')),
    preu_total DECIMAL(6,2) NOT NULL,
    adreca_enviament TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for orders
-- Users can see their own orders (as buyers)
CREATE POLICY "Users can view their own orders" ON orders 
FOR SELECT USING (auth.uid() = comprador_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders 
FOR INSERT WITH CHECK (auth.uid() = comprador_id);

-- (Optional) Sellers can see orders for their books
-- CREATE POLICY "Sellers can view orders for their books" ON orders
-- FOR SELECT USING (EXISTS (
--     SELECT 1 FROM books 
--     WHERE books.id = orders.book_id AND books.venedor_id = auth.uid()
-- ));
