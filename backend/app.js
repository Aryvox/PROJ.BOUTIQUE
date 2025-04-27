const express = require('express');
const app = express();
const port = 3001;
const path = require('path');
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
app.use(cors({
    origin: "*"
}));

// Servir les fichiers statiques
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
const productsRoutes = require('./routes/products');
app.use('/api/products', productsRoutes);

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});