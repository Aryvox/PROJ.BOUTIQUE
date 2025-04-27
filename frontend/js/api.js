// Configuration de l'API
const API_URL = 'http://localhost:3001/api/products';

// Fonctions pour les appels API
export const api = {
    // Récupérer tous les produits
    async getProducts() {
        try {
            const response = await fetch(`${API_URL}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des produits');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    },

    // Récupérer un produit par ID
    async getProductById(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du produit');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    },

    // Récupérer les images d'un produit
    async getProductImages(id) {
        try {
            const response = await fetch(`${API_URL}/${id}/images`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des images');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    },

    // Récupérer les produits similaires
    async getSimilarProducts(id) {
        try {
            const response = await fetch(`${API_URL}/${id}/similar`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des produits similaires');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    },

    // Mettre à jour le stock d'un produit
    async updateProductStock(id, quantity) {
        try {
            const response = await fetch(`${API_URL}/${id}/stock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity }),
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du stock');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }
}; 