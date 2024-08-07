DROP TABLE IF EXISTS scooters;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(40),
    name VARCHAR(100),
    password_hash VARCHAR(100)
);

INSERT INTO users (email, name, password_hash) VALUES
    ('jannikhuschka@gmail.com', 'Jannik Huschka', '$2a$10$PqSVaWL1yAtsztbHiijC5emugevyxQYOq3k1hpNUS0BJ3CT1w.jqy'),
    ('chiara.lomb@hotmail.it', 'Chiara Lombardo', '$2a$10$NpurlaJ0CvUOQ1lN3AOSBuSskwmFvI/HUA7B3tvjOEx2HBvN1gwjS')
ON CONFLICT DO NOTHING;

CREATE TABLE scooters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL,
    year INTEGER,
    power DECIMAL,
    model VARCHAR(100),
    owner INTEGER NOT NULL,
    FOREIGN KEY (owner) REFERENCES users(id)
);

INSERT INTO scooters (name, description, price, year, power, model, owner) VALUES
    ('Scooter Model A', 'A great scooter', 299.99, 2012, 125.0, 'Vespa GTS Super 125', 1),
    ('Scooter Model B', 'An awesome scooter', 399.99, 2008, 145.4, 'Vespa GTV', 2)
ON CONFLICT DO NOTHING;

CREATE TABLE wishlist (
    user_id SERIAL,
    scooter_id SERIAL,
    PRIMARY KEY (user_id, scooter_id)
);

INSERT INTO wishlist (user_id, scooter_id) VALUES
    (1, 2),
    (2, 1)
ON CONFLICT DO NOTHING;

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER,
    scooter_id INTEGER,
    owner_id INTEGER,
    state VARCHAR(20),
    message_buyer TEXT,
    message_seller TEXT,
    timestamp TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (scooter_id) REFERENCES scooters(id),
    CHECK (state IN ('offer', 'accept-owner', 'accept-both', 'reject'))
);

INSERT INTO messages (buyer_id, scooter_id, owner_id, state, message_buyer, message_seller, timestamp) VALUES
    (1, 2, 2, 'offer', 'You have sent a buying request to Chiara.', 'Jannik would like to buy your scooter.', '2021-06-01 12:00:00'),
    (2, 1, 1, 'accept-owner', 'Jannik has agreed to sell you their scooter.', 'You accepted the buying request from Chiara.', '2021-06-01 12:00:00')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL COLLATE "default",
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,
    PRIMARY KEY ("sid")
) WITH (OIDS=FALSE);