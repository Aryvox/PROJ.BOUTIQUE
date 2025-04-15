const Sneaker = require('../models/sneaker');

exports.getSneakers = (req, res) => {

    res.status(200).json({
        message: "Sneaker found",
        sneakers
    })};

exports.getSneakerByID = async (req, res) => {
        const id = parseInt(req.params.id);

        const sneaker = await Sneaker.getById(id);
        
        if (!sneaker) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
    
        res.status(200).json({
            message: "Product found",
            sneaker
        });
    };