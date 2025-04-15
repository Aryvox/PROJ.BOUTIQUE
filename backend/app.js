const express = require('express');
const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors({
    origin: "*"
}));

const sneakersRoutes = require('./routes/sneakers');
app.use(sneakersRoutes);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});