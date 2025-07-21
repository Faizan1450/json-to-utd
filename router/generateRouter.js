const express = require('express');
const generateRouter = express.Router();
const generateUTD = require('../controller/generateUTD')

//! Generate Route
generateRouter.post('/create' ,generateUTD);

module.exports = generateRouter;