const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load YAML swagger documentation file
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('[Swagger] API Documentation available at /api-docs');
};

module.exports = setupSwagger;