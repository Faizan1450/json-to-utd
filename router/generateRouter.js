const express = require('express');
const generateRouter = express.Router();
const generateUTD = require('../controller/generateUTD')

generateRouter.post('/generate', generateUTD);

module.exports = generateRouter;