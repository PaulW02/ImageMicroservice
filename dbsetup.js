const mysql = require('mysql2');

// Rest of your code remains unchanged

// Konfiguration för anslutning till MySQL-databasen
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: 'root',
    password: '12345679'
});

// Anslut till databasen
connection.connect((err) => {
    if (err) {
        console.error('Kunde inte ansluta till databasen:', err);
        return;
    }
    console.log('Ansluten till databasen');

    // Skapa en databas om den inte redan finns
    connection.query('CREATE DATABASE IF NOT EXISTS imagesDB', (err) => {
        if (err) {
            console.error('Kunde inte skapa databasen:', err);
            return;
        }
        console.log('Databas skapad eller redan existerande');

        // Använd den nyskapade databasen
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
                connection.end(); // Stäng anslutningen när allt är klart
            });
        });
    });
});
