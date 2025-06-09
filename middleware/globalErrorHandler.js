const globalErrorhandler = (error, req, resp, next) => {
    const status = error?.status ? error.status : "Failed"
    const message = error?.message;
    const stack = error?.stack;
    const statusCode = error?.statusCode ? error.statusCode : 500;
    resp.status(statusCode).json({ status, message, stack });
};

const notFound = (req, resp, next) => {
    const error = new Error(`Cannot find the route for ${req.originalUrl} at the server`);
    // Set the status code to 404
    error.statusCode = 404;
    next(error);
};

module.exports = { globalErrorhandler, notFound }