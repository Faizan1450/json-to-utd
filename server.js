const express = require('express');
const dotenv = require('dotenv');
const generateRouter = require('./router/generateRouter');
const { globalErrorhandler, notFound } = require('./middleware/globalErrorHandler');
const cors = require('cors');

//! Load the Environment Variable
dotenv.config();

//! Create an Express App
const app = express()

//! Set up the middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// Routes
//?Setup the User route
app.use('/api/v1/', generateRouter);

//! Not Found error handler
app.use(notFound);

//! Global Exception Handler
//? Setup Global Exception Handler
app.use(globalErrorhandler)

//! Start The Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Stated at ${PORT}`)
})