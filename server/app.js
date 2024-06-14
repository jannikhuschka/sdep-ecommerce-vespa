const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 5001;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM scooters');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/products', async (req, res) => {
    console.log('Adding scooter for god\'s sake!');
    try {
        const { name, description, year, model, power, price } = req.body;
        await pool.query(
            'INSERT INTO scooters (name, description, year, model, power, price) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, description, year, model, power, price]
        );
        res.status(201).send('Scooter added');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// The "catchall" handler: for any request that doesn't match "/api", send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
