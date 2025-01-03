export const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path
    });

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
};