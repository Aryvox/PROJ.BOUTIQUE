const express = require('express');
const router = express.Router();
const controllers = require('../controllers/sneaker.js');

router.get('/sneakers', controllers.getSneakers);
router.get('/sneaker/:id', controllers.getSneakerByID);

module.exports = router;