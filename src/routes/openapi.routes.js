const express           = require('express');
const openapiController = require('../controllers/openapi.controller');

const router = express.Router();

router.get('/openapi.json', openapiController.openapi);

module.exports = router;
