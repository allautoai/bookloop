-- Insert categories
INSERT INTO categories (nom, descripcio) VALUES
    ('Fiction', 'Fictional books and novels'),
    ('Sci-Fi', 'Science Fiction literature'),
    ('Textbooks', 'Educational text books'),
    ('Children', 'Books for children'),
    ('Poetry', 'Poems and poetry collections'),
    ('History', 'Historical books and biographies');

-- Create a dummy user to act as the seller for these books
-- In a real scenario, this would be a user registered via Supabase Auth
INSERT INTO users (id, email, nom, avatar_url, ubicacio, valoracio_mitjana)
VALUES (
    uuid_generate_v4(), 
    'demo_vendor@bookloop.com', 
    'Demo Vendor', 
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
    'Barcelona', 
    4.5
);

-- We need to assign books to this user, but since UUIDs are auto-generated, we must use a small DO block or just a subquery
DO $$ 
DECLARE 
    seller_id UUID;
    cat_fiction INT;
    cat_scifi INT;
    cat_children INT;
BEGIN
    -- Get the seller ID
    SELECT id INTO seller_id FROM users WHERE email = 'demo_vendor@bookloop.com' LIMIT 1;
    
    -- Get category IDs
    SELECT id INTO cat_fiction FROM categories WHERE nom = 'Fiction' LIMIT 1;
    SELECT id INTO cat_scifi FROM categories WHERE nom = 'Sci-Fi' LIMIT 1;
    SELECT id INTO cat_children FROM categories WHERE nom = 'Children' LIMIT 1;

    -- Insert the 8 requested seed books
    INSERT INTO books (venedor_id, categoria_id, titol, autor, idioma, estat, preu, foto_url, descripcio) VALUES
    (seller_id, cat_fiction, 'El Hobbit', 'J.R.R. Tolkien', 'Català', 'bon_estat', 7.50, 'https://images.unsplash.com/photo-1629196914275-d22eb734e5a9?auto=format&fit=crop&q=80&w=600&h=800', 'Un clàssic de la literatura fantàstica en bon estat.'),
    (seller_id, cat_scifi, '1984', 'George Orwell', 'Castellà', 'com_a_nou', 6.00, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=600&h=800', 'Novel·la distòpica gairebé nova.'),
    (seller_id, cat_fiction, 'Cien años de soledad', 'Gabriel García Márquez', 'Castellà', 'acceptable', 4.50, 'https://images.unsplash.com/photo-1456615074700-1dc12aa7364d?auto=format&fit=crop&q=80&w=600&h=800', 'Les pàgines estan una mica grogues pel temps, però es pot llegir perfectament.'),
    (seller_id, cat_fiction, 'El nombre del viento', 'Patrick Rothfuss', 'Castellà', 'nou', 10.00, 'https://images.unsplash.com/photo-1526481280620-1d8bd3d0774a?auto=format&fit=crop&q=80&w=600&h=800', 'Llibre completament nou, mai llegit.'),
    (seller_id, cat_scifi, 'Dune', 'Frank Herbert', 'Anglès', 'bon_estat', 8.99, 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=600&h=800', 'Edició en anglès, la coberta està una mica desgastada.'),
    (seller_id, cat_children, 'El principito', 'Antoine de Saint-Exupéry', 'Català', 'com_a_nou', 5.00, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600&h=800', 'Llegit un cop. Interior perfecte.'),
    (seller_id, cat_scifi, 'Fahrenheit 451', 'Ray Bradbury', 'Castellà', 'bon_estat', 6.50, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600&h=800', 'Clàssic imprescindible en molt bon estat.'),
    (seller_id, cat_fiction, 'La sombra del viento', 'Carlos Ruiz Zafón', 'Castellà', 'nou', 12.50, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600&h=800', 'Un viatge pel cementiri dels llibres oblidats.');
END $$;
