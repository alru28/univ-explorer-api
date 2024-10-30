const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({ // PostgreSQL pool setup
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

app.use((req, res, next) => {
    req.pool = pool;
    next();
}); 

// Auth Router
app.use('/auth', authRoutes);

// Setup Swagger and serve the YAML documentation of the API
const swaggerDocument = YAML.load('./api-doc.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));