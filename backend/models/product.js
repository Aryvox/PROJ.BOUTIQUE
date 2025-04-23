const db = require('../config/db');

class Product {
    static async getAll() {
        try {
            const query = 'SELECT * FROM products';
            const [results] = await db.query(query);
            return results;
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const query = 'SELECT * FROM products WHERE product_id = ?';
            const [results] = await db.query(query, [id]);
            return results[0];
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            throw error;
        }
    }
}

module.exports = Product;