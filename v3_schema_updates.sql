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
BEGIN
  UPDATE users
  SET valoracio_mitjana = (
    SELECT ROUND(AVG(puntuacio)::numeric, 1)
    FROM reviews
    WHERE valorat_id = NEW.valorat_id
  )
  WHERE id = NEW.valorat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user rating on new review
DROP TRIGGER IF EXISTS on_review_added ON reviews;
CREATE TRIGGER on_review_added
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Storage bucket for avatars (if not using book-images)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
