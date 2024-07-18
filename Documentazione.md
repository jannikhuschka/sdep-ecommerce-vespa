Progetto di Sistemi Distribuiti e Paralleli
a.a. 2023/2024
Docente: Sergio Tasso
Studenti: Jannik Huschka (365546), Chiara Lombardo (330350)

## Introduzione
**eCommerce Motorini** è una piattaforma di compravendita per chiunque desideri acquistare o vendere motorini in modo semplice e veloce. È ideale per appassionati di due ruote, professionisti del settore e chiunque stia cercando un nuovo motorino. La piattaforma permette di accedere a un vasto catalogo di motorini in qualsiasi momento e da qualsiasi luogo, facilitando la ricerca e l'acquisto grazie a filtri avanzati e funzionalità di ricerca.

## Caratteristiche
Tecnologie utilizzate:
- **Frontend**: HTML e React.js per la creazione di un'interfaccia utente reattiva e dinamica.
- **Stili**: CSS per la personalizzazione e la gestione dell'aspetto grafico del sito.
- **Backend**: Node.js con Express per la gestione delle richieste e delle risposte del server.
- **Database**: PostgreSQL per la memorizzazione dei dati relativi agli utenti e ai motorini.
- **Middleware**: Multer per la gestione del caricamento dei file.
- **API**: RESTful API per la comunicazione tra il frontend e il backend

## Erogatori e fruitori
Gli utenti sono sia da **erogatori** che **fruitori**, poiché chiunque può mettere in vendita il proprio motorino o cercare di acquistare un motorino disponibile.
Questa struttura rende eCommerce Motorini una piattaforma collaborativa e interattiva, dove ogni utente contribuisce attivamente al mercato, creando un ecosistema dinamico e paritario.

## Docker e Docker Compose
L'intera applicazione può essere facilmente distribuita e scalata su diverse piattaforme, grazie all'uso di Docker.
### Quickstart
Per iniziare, usiamo i comandi:
- `docker-compose down --volumes`: arresta ed elimina i container, le reti e le immagini definite nel file `docker-compose.yml`, e rimuove anche i volumi associati, cancellando i dati persistenti memorizzati in essi.
- `docker-compose up --build`: avvia i container definiti nel file `docker-compose.yml`, ricostruendo le immagini dei container prima di avviarli se sono state apportate modifiche ai Dockerfile o ai contesti di build.

### Il file docker-compose.yml
Il file `docker-compose.yml` definisce i servizi, le reti e i volumi necessari per l'applicazione, consentendo di gestire facilmente il ciclo di vita dei container.

```YML
version: '3'
services:
	db:
	    image: postgres:13
	    environment:
		    POSTGRES_USER: admin
		    POSTGRES_PASSWORD: admin
		    POSTGRES_DB: commerce
	    ports:
		    - "5432:5432"
	    volumes:
		    - pgdata:/var/lib/postgresql/data
		    - ./init.sql:/docker-entrypoint-initdb.d/init.sql
	web:
	    build: .
	    ports:
		    - "5001:5001"
	    volumes:
		    - ./images:/app/images
	    depends_on:
		    - db
	    environment:
		    DB_USER: admin
		    DB_PASSWORD: admin
		    DB_NAME: commerce
		    DB_HOST: db
```

#### Servizi definiti nel file docker-compose.yml
- `db`: Il servizio per il database PostgreSQL. Imposta le variabili di ambiente per configurare il database, mappa la porta 5432 e monta volumi per i dati e inizializzare il database.
- `web`: L'applicazione web che interagisce con PostgreSQL. Configura l'ambiente con le variabili necessarie, dipende dal servizio `db`, mappa la porta 5001 dell'host a quella del container e imposta le variabili di ambiente per connettersi al database.
### Esempio di Dockerfile per un'applicazione Node.js
```YAML
# Use the official Node.js image as a base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
# RUN cd client && npm install && npm run build

# Expose the port the server runs on
EXPOSE 5001

# Start the server
CMD ["node", "server/app.js"]
```

## REST
Il progetto è stato sviluppato seguendo l'approccio REST creando così una RESTful API.
Come prevede REST, per ogni risorsa avremo un link, che consente l'accesso e l'interazione con le risorse. 
Le risorse vengono richieste e manipolate dal client attraverso richieste **http**. Questo principio stabilisce una mappatura uno a uno tra le tipiche operazioni **CRUD**.

Vediamo ora degli esempi per ogni operazione CRUD.
### Create (POST)
Lato server (App.js)
```js
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
            fs.copyFileSync('./images/profile/default.png', ./images/profile/${user.id}.png);
            req.session.userID = user.id;
            req.session.authenticated = true;
            res.status(201).send(user);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
```

### Read (GET)
```js
app.get('/api/products', async (req, res) => {
    try {
        var result = await pool.query(
            SELECT scooters.id AS id, scooters.name as name, description, year, model, power, price, owner, users.name AS owner_name
            FROM (scooters JOIN users ON scooters.owner = users.id)
        );
        res.json(getImagesForScooters(result.rows));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
```

### Update (PUT)
```js
app.put('/api/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id;
        const { state } = req.body;
        const buyer = (await pool.query(`
	        SELECT * 
		    FROM (messages JOIN users ON buyer_id=users.id)
		    WHERE messages.id = $1`,
		    [messageId])).rows[0];
        const owner = (await pool.query(
	        `SELECT *
	        FROM (messages JOIN users ON owner_id=users.id)
	        WHERE messages.id = $1`,
	        [messageId])).rows[0];
        var message_buyer, message_seller;
        ...
        await pool.query(`
            UPDATE messages
            SET state = $1, message_buyer = $3, message_seller = $4, timestamp = $5
            WHERE id = $2`,
            [state, messageId, message_buyer, message_seller, new Date()]
            );
        res.status(200).send('Message updated');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
```

### Delete (DELETE)
```js
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
```

## JSON
Una volta ricevuta la richiesta, le API progettate per REST restituiscono formati in formato **JSON**.
Molto importante è stata la decisione del formato di scambio di dati da usare. In questo caso si è usato JSON. Lo si è scelto principalmente per la sua semplicità nel convertire un oggetto JSON in un oggetto JavaScript, ma anche per la sua facile leggibilità e leggerezza. Ha facilitato l'integrazione dei dati tra il server e il client.

Il file package.json contiene tutte le informazioni relative all'applicazione.
```JSON
{
	"name": "sdep-ecommerce-vespa",
	"version": "1.0.0",
	"description": "Progetto di SDEP all'UniPG di Chiara Lombardo e Jannik Huschka",
	"main": "index.js",
	"scripts": {
	    "test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"dependencies": {
	    "bcryptjs": "^2.4.3",
	    "body-parser": "^1.20.2",
	    "connect-pg-simple": "^9.0.1",
	    "cookie-parser": "^1.4.6",
	    "cors": "^2.8.5",
	    "express": "^4.19.2",
	    "express-session": "^1.18.0",
	    "jimp": "^0.22.12",
	    "multer": "^1.4.5-lts.1",
	    "passport": "^0.7.0",
	    "passport-json": "^1.2.0",
	    "passport-local": "^1.0.0",
	    "pg": "^8.12.0",
	    "postgres": "^3.4.4",
	    "sharp": "^0.33.4"
	}
}
```

## Database - PostgreSQL
Il database utilizzato è PostgreSQL, configurato per gestire l'archiviazione e la gestione dei dati relativi agli utenti, agli scooter, alla wishlist e agli annunci di vendita.

```SQL
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(40),
    name VARCHAR(100),
    password_hash VARCHAR(100)
);

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

CREATE TABLE wishlist (
    user_id SERIAL,
    scooter_id SERIAL,
    PRIMARY KEY (user_id, scooter_id)
);

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

CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL COLLATE "default",
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,
    PRIMARY KEY ("sid")
) WITH (OIDS=FALSE);
```
