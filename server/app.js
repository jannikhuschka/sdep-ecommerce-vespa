const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'jannikhuschka',
    host: 'localhost',
    database: 'commerce',
    password: 'admin',
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

