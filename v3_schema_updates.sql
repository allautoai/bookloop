-- Ensure users table has the rating column
ALTER TABLE users ADD COLUMN IF NOT EXISTS valoracio_mitjana NUMERIC(3,1) DEFAULT 0.0;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    autor_id UUID NOT NULL REFERENCES users(id),
    valorat_id UUID NOT NULL REFERENCES users(id),
    puntuacio INT NOT NULL CHECK (puntuacio BETWEEN 1 AND 5),
    comentari TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "allow_select_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "allow_insert_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (autor_id = auth.uid());

-- Function to update user rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_user_id := OLD.valorat_id;
    ELSE
        target_user_id := NEW.valorat_id;
    END IF;

    UPDATE users
    SET valoracio_mitjana = COALESCE((
        SELECT ROUND(AVG(puntuacio)::numeric, 1)
        FROM reviews
        WHERE valorat_id = target_user_id
    ), 0.0)
    WHERE id = target_user_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user rating on any review change
DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Storage bucket for avatars (if not using book-images)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 4. RLS for orders (ensure sellers can see their sales)
DROP POLICY IF EXISTS "Sellers can view orders for their books" ON orders;
CREATE POLICY "Sellers can view orders for their books" ON orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM books
    WHERE books.id = orders.book_id
    AND books.venedor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Buyers can view their own orders" ON orders;
CREATE POLICY "Buyers can view their own orders" ON orders
FOR SELECT USING (auth.uid() = comprador_id);

DROP POLICY IF EXISTS "Buyers can create orders" ON orders;
CREATE POLICY "Buyers can create orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = comprador_id);

DROP POLICY IF EXISTS "Users can update order status" ON orders;
CREATE POLICY "Users can update order status" ON orders
FOR UPDATE USING (
  auth.uid() = comprador_id OR 
  EXISTS (
    SELECT 1 FROM books 
    WHERE books.id = orders.book_id 
    AND books.venedor_id = auth.uid()
  )
);
