CREATE TABLE IF NOT EXISTS scooters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL,
    year INTEGER,
    power DECIMAL,
    model VARCHAR(100),
    image_url TEXT
);

INSERT INTO scooters (name, description, price, year, power, model, image_url) VALUES
('Scooter Model A', 'A great scooter', 299.99, 2012, 125.0, 'Vespa GTS Super 125', 'https://images.piaggio.com/vespa/vehicles/nvh1000u04/nvh1r7uu04/nvh1r7uu04-01-m.png'),
('Scooter Model B', 'An awesome scooter', 399.99, 2008, 145.4, 'Vespa GTV', 'https://images.piaggio.com/vespa/vehicles/nvh4000u01/nvh4q3zu01/nvh4q3zu01-01-m.png')
ON CONFLICT DO NOTHING;
