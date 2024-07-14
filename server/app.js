const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5001;
const bcrypt = require('bcryptjs');
const multer = require('multer');
const bodyParser = require('body-parser');
const sharp = require('sharp');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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

// Middleware setup
// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 24 * 60 * 60 * 1000 }
// }));

app.use(
    session({
      store: new PgSession({
        pool: pool, // Connection pool
        tableName: "session", // Use the session table we created
      }),
      secret: "your_secret_key", // Replace with your own secret
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, //cookies last 30 days
        sameSite: "none", // Allows the cookie to be sent in all contexts
      }, // 30 days
    })
  );

// var profilePicStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './images/profile')
//     },
//     filename: function (req, file, cb) {
//       console.log(req.session);
//       cb(null, String(req.session.userID) + path.extname(file.originalname))
//     }
// })
var imageMemoryStorage = multer.memoryStorage();
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb("Please upload only images.", false);
    }
};
var imageUpload = multer({ storage: imageMemoryStorage, fileFilter: imageFilter });

const manipulateProfilePic = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    try {
        // crop image to square and resize to 512x512, then save as png
        await sharp(req.file.buffer).resize({ width: 512, height: 512, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ quality: 90 }).toFile(`./images/profile/${req.session.userID}.png`);
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const manipulateScooterPics = async (req, res, next) => {
    if (!req.files) {
        return next();
    }
    try {
        const id = req.params.id;
        console.log('Adding images for scooter with id: ', id);

        // create folder for scooter images with respective id
        const dir = `./images/scooters/${id}`;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        // resize to contain in 1920x1080, then save as png with index as file name
        for (let i = 0; i < req.files.length; i++) {
            await sharp(req.files[i].buffer).resize({ width: 1920, height: 1080, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ quality: 90 }).toFile(`./images/scooters/${id}/${i + 1}.png`);
            // await sharp(req.files[i].buffer).resize({ width: 1920, height: 1080 }).jpeg({ quality: 90 }).toFile(`./images/scooters/${id}/${i + 1}.jpeg`);
        }

        // 512x512 preview image
        await sharp(req.files[0].buffer).resize({ width: 512, height: 512 }).png({ quality: 90 }).toFile(`./images/scooters/${id}/preview.png`);
        return res.status(201).send('Images uploaded');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

app.use(express.static(__dirname + '/public'));
app.use('/images', express.static('images'))

function getImagesForScooters(rows) {
    for (let i = 0; i < rows.length; i++) {
        const id = rows[i].id;
        const dir = `./images/scooters/${id}`;
        const files = fs.readdirSync(dir);
        rows[i].images = [];
        for (let j = 0; j < files.length; j++) {
            if (files[j] === 'preview.png') {
                rows[i].preview = `http://localhost:5001/images/scooters/${id}/preview.png`;
                continue;
            }
            rows[i].images.push(`http://localhost:5001/images/scooters/${id}/${files[j]}`);
        }
        rows[i].profilePic = `http://localhost:5001/images/profile/${rows[i].owner}.png`;
    }
    console.log(rows);
    return rows;
}

app.post('/api/profile-picture', imageUpload.single('profile-pic'), manipulateProfilePic, function async (req, res, next) {
  console.log(req.session);
  res.status(201).send('Profile picture uploaded');
})

app.get('/api/products', async (req, res) => {
    try {
        var result = await pool.query('SELECT scooters.id AS id, scooters.name as name, description, year, model, power, price, owner, users.name AS owner_name FROM (scooters JOIN users ON scooters.owner = users.id)');
        res.json(getImagesForScooters(result.rows));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/products/filtered', async (req, res) => {
    try {
        const search = req.query.search;
        const priceRange = req.query.priceRange;
        const yearRange = req.query.yearRange;
        const powerRange = req.query.powerRange;
        var result = await pool.query(`
            SELECT scooters.id AS id, scooters.name as name, description, year, model, power, price, owner, users.name AS owner_name
            FROM (scooters JOIN users ON scooters.owner = users.id)
            WHERE (LOWER(scooters.name) ILIKE LOWER($1)
            OR LOWER(description) ILIKE LOWER($1)
            OR LOWER(model) ILIKE LOWER($1))
            AND price >= $2 AND price <= $3
            AND year >= $4 AND year <= $5
            AND power >= $6 AND power <= $7
            `, ['%' + search + '%', priceRange[0], priceRange[1], yearRange[0], yearRange[1], powerRange[0], powerRange[1]]);
        res.json(getImagesForScooters(result.rows));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/products/extremeValues', async (req, res) => {
    try {
        const attribute = req.query.attribute;
        var low = await pool.query(`SELECT ${attribute} FROM scooters ORDER BY ${attribute} ASC LIMIT 1`);
        var high = await pool.query(`SELECT ${attribute} FROM scooters ORDER BY ${attribute} DESC LIMIT 1`);
        low = Math.floor(parseFloat(low.rows[0][attribute]));
        high = Math.ceil(parseFloat(high.rows[0][attribute]));
        res.json([low, high]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/products', async (req, res) => {
    console.log('Adding scooter');
    try {
        console.log(req.body);
        // const { name, description, year, model, power, price } = req.body
        // const owner = req.session.userID;
        const result = await pool.query(
            'INSERT INTO scooters (name, description, year, model, power, price, owner) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [req.body.name, req.body.description, req.body.year, req.body.model, req.body.power, req.body.price, req.session.userID]
        );
        const id = result.rows[0].id;
        res.status(201).json({ 'id': id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/products/:id/images', imageUpload.array('scooter-pictures', 10), manipulateScooterPics);

app.get('/api/wishlist', async (req, res) => {
    try {
        const userId = req.session.userID;
        if (!userId) {
            return res.status(401).send('Not logged in');
        }
        const result = await pool.query(`
            SELECT scooters.id AS id, scooters.name as name, description, year, model, power, price, owner, users.name AS owner_name
            FROM ((scooters JOIN users ON scooters.owner = users.id) JOIN wishlist ON scooters.id=scooter_id)
            WHERE wishlist.user_id = $1`,
            [userId]);
        res.json(getImagesForScooters(result.rows));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const userId = req.session.userID;
        if (!userId) {
            return res.status(401).send('Not logged in');
        }

        // get all messages concerning user
        const messages = await pool.query(`
            SELECT * FROM ((messages JOIN users AS sender ON sender_id=sender.id) JOIN users AS receiver ON receiver_id=receiver.id) WHERE sender_id = $1 OR receiver_id = $1 ORDER BY scooter_id, timestamp`,
            [userId]);

        // get all scooters concerning messages
        // const scooters = await pool.query('SELECT * FROM scooters WHERE id IN $1 ORDER BY id', [messages.rows.map(row => row.scooter_id)]);
        var scooters = await pool.query(`
            SELECT scooters.id AS id, scooters.name as name, description, year, model, power, price, owner, users.name AS owner_name
            FROM (scooters JOIN users ON scooters.owner = users.id)
            WHERE EXISTS (SELECT 1 FROM messages WHERE scooter_id = scooters.id AND (sender_id = $1 OR receiver_id = $1))
            ORDER BY scooters.id
            `, [userId]);
        
        // create dict that maps scooter id to scooter
        const scooterDict = {};
        for (let i = 0; i < scooters.rows.length; i++) {
            scooterDict[scooters.rows[i].id] = scooters.rows[i];
        }

        // add messages to respective scooters
        for (let i = 0; i < messages.rows.length; i++) {
            const scooter = scooterDict[messages.rows[i].scooter_id];
            if (!scooter.messages) scooter.messages = [];
            scooter.messages.push(messages.rows[i]);
        }

        // put elements from dict back into array
        scooters = [];
        for (const key in scooterDict) {
            scooters.push(scooterDict[key]);
        }

        res.json(getImagesForScooters(scooters));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(404).send('User not found');
        } else {
            const user = result.rows[0];
            // console.log('User: ', user.name);
            // console.log('Password: ', user.password_hash);
            if (bcrypt.compareSync(password, user.password_hash)) {
                // res.cookie('authToken', user.id, { maxAge: 24 * 60 * 60, httpOnly: true });
                req.session.userID = user.id;
                req.session.authenticated = true;
                req.session.save((err) => {
                    if (err) {
                        return res.status(500).send('Failed to save session');
                    }
                    // console.log(req.session); // Should print the session with user_id
                    // res.redirect('/');
                });
                res.status(200).send(user);
            } else {
                res.status(401).send('Wrong password');
            }
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/user', async (req, res) => {
    console.log(req.session);
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userID]);
        if (result.rows.length === 0) {
            return res.status(200).json({ message: 'User not found' });
        }
        const user = result.rows[0];
        const wishlistResult = await pool.query('SELECT scooter_id FROM wishlist WHERE user_id = $1', [user.id]);
        user.wishlist = wishlistResult.rows.map(row => row.scooter_id);
        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            res.status(409).send('User already exists');
        } else {
            const passwordHash = bcrypt.hashSync(password, 10);
            await pool.query(
                'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
                [name, email, passwordHash]
            );
            const query = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = query.rows[0];
            fs.copyFileSync('./images/profile/default.png', `./images/profile/${user.id}.png`);
            req.session.userID = user.id;
            req.session.authenticated = true;
            res.status(201).send(user);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/logout', async (req, res) => {
    req.session = null;
    res.clearCookie("connect.sid", {
        path: "/",
        sameSite: "none",
    }); // This line ensures the cookie is cleared
    res.status(200).send('Logged out');
});

app.post('/api/wishlist', async (req, res) => {
    try {
        const { scooterId } = req.body;
        const userId = req.session.userID;
        await pool.query('INSERT INTO wishlist (user_id, scooter_id) VALUES ($1, $2)', [userId, scooterId]);
        res.status(201).send('Added to wishlist');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.delete('/api/wishlist', async (req, res) => {
    try {
        const { scooterId } = req.body;
        const userId = req.session.userID;
        await pool.query('DELETE FROM wishlist WHERE user_id = $1 AND scooter_id = $2', [userId, scooterId]);
        res.status(200).send('Removed from wishlist');
    }
    catch (err) {
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
