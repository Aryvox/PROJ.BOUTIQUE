const express = require('express');
const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors({
    origin: "*"
}));

const productsRoutes = require('./routes/products');
app.use(productsRoutes);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});