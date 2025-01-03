const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth');

// APP
const app = express();

// CORS
app.use(express.json());
app.use(cors());

// POSTGRESQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});


app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// ROUTES
app.use('/', (req, res, next) => {
    console.log(`Incoming ${req.method} request to: ${req.originalUrl}`);
    next();
}, authRoutes);

// SWAGGER DOC
const swaggerDocument = YAML.load('./api-doc.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ERROR HANDLING
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use((req, res) => {
    console.log(`404: ${req.method} ${req.originalUrl}`);
    res.status(404).send('Route not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Auth endpoints available at http://0.0.0.0:${PORT}/`);
    console.log(`Documentation available at http://0.0.0.0:${PORT}/docs`);
});