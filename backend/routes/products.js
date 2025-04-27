const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier data.json
const dataPath = path.join(__dirname, '../data.json');

// Route pour obtenir tous les produits
router.get('/', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json(data.components);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }
});

// Route pour obtenir un produit par ID
router.get('/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const product = data.components.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }
});

// Route pour mettre à jour le stock d'un produit
router.put('/:id/stock', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const productIndex = data.components.findIndex(p => p.id === parseInt(req.params.id));
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        const { quantity } = req.body;
        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ error: 'Quantité invalide' });
        }
        
        data.components[productIndex].available = quantity > 0;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        
        res.json(data.components[productIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des données' });
    }
});

// Route pour obtenir les images d'un produit
router.get('/:id/images', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const product = data.components.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        const images = [product.img_1, product.img_2, product.img_3].filter(img => img);
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }
});

// Route pour obtenir les produits similaires
router.get('/:id/similar', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const product = data.components.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        // Trouver les produits similaires basés sur les caractéristiques
        const similarProducts = data.components
            .filter(p => p.id !== product.id)
            .slice(0, 4); // Limiter à 4 produits similaires
        
        res.json(similarProducts);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }
});

module.exports = router;