const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Skapa anslutning till din MySQL-databas
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: 'root',
    password: '12345679',
});

// Anslut till databasen
connection.connect((err) => {
    if (err) {
        console.error('Could not connect to the database:', err);
        return;
    }

    console.log('Connected to the database');

    // Check if the database exists, and create it if not
    connection.query('CREATE DATABASE IF NOT EXISTS ??', [process.env.DB_NAME || 'imagesDB'], (err) => {
        if (err) {
            console.error('Could not create the database:', err);
            return;
        }

        console.log('Database created or already exists');

        // Use the selected database
        connection.query('USE imagesDB', (err) => {
            if (err) {
                console.error('Kunde inte använda databasen:', err);
                return;
            }
            console.log('Connected');

            // Skapa en tabell för bilder om den inte redan finns
            const createImagesTableQuery =
                `CREATE TABLE IF NOT EXISTS images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          imageData LONGTEXT, 
          encounterId INT
        )`;

            connection.query(createImagesTableQuery, (err) => {
                if (err) {
                    console.error('Kunde inte skapa tabellen för bilder:', err);
                    return;
                }
                console.log('Tabell för bilder skapad eller redan existerande');
            });
        });
    });
});

/*const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Spara filen i en mapp som heter 'uploads'
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Spara filen med dess ursprungliga namn
  }
});*/

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/image/upload/:encounterId', upload.single('image'), (req, res) => {
    const encounterID = req.params.encounterId;
    const imageBuffer = req.file.buffer; // Get the buffer from the uploaded file

    // Convert the buffer to a base64 string
    const base64String = imageBuffer.toString('base64');

    const query = 'INSERT INTO images (imageData, encounterID) VALUES (?, ?)';

    connection.query(query, [base64String, encounterID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading the image.');
        }

        res.status(200).send('Image uploaded to database');
    });
});

app.post('/image/upload', upload.single('image'), (req, res) => {
    const imageBuffer = req.file.buffer; // Get the buffer from the uploaded file

    // Convert the buffer to a base64 string
    const base64String = imageBuffer.toString('base64');

    const query = 'INSERT INTO images (imageData) VALUES (?)';

    connection.query(query, [base64String], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading the image.');
        }

        res.status(200).send('Image uploaded to database');
    });
});

app.get('/image/images/:encounterId', (req, res) => {
    const encounterID = req.params.encounterId;

    const query = 'SELECT * FROM images WHERE encounterId = ?';

    connection.query(query, [encounterID], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching images by encounter ID.');
        }
        res.status(200).json(results);
    });
});

app.get('/image/images', (req, res) => {
    const query = 'SELECT * FROM images'; // Justera för din tabell och kolumnnamn

    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ett fel inträffade vid hämtning av bilder.');
        }
        res.status(200).json(results);
    });
});

app.post('/image/update-image/:id', (req, res) => {
    const id = req.params.id;
    const { image } = req.body;

    const query = 'UPDATE images SET imageData = ? WHERE id = ?';

    connection.query(query, [image, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating the image.');
        }

        res.status(200).send('Image updated in the database');
    });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
    console.log(`Servern är igång på port ${PORT}`);
});
