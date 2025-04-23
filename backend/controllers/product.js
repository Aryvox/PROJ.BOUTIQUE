const Product = require('../models/product');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.status(200).json({
            message: "Products found",
            products
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products",
            error: error.message
        });
    }
};

exports.getProductByID = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const product = await Product.getById(id);
        
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
    
        res.status(200).json({
            message: "Product found",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching product",
            error: error.message
        });
    }
};