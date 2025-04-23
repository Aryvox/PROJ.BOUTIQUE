const express = require('express');
const router = express.Router();
const controllers = require('../controllers/product.js');

router.get('/products', controllers.getProducts);
router.get('/product/:id', controllers.getProductByID);

module.exports = router;