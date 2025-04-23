const mysql = require('mysql2/promise');

const pool = new mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'votre_mot_de_passe', // Remplacez par votre mot de passe MySQL
    database: 'projet_js',
    connectionLimit: 10,
    queueLimit: 0,
});

pool.getConnection()
    .then((connection) => {
        console.log('Connected to the database');
        connection.release();
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error);
    });

module.exports = pool;