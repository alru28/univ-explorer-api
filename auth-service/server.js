const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// Auth Router
const authRoutes = require('./routes/auth');
app.use('/api/user', authRoutes);

// Setup Swagger and serve the YAML documentation of the API
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api-doc.yaml');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));