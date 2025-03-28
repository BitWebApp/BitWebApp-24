const asyncHandler = (fn) => async (req, res, next) => {
    try {
        return await fn(req, res, next);
    } catch (error) {
        let statusCode = error.statusCode || 500;
        if (statusCode < 100 || statusCode >= 600) {
            // If the status code is not in the valid range, set it to 500
            statusCode = 500;
        }
        res.status(statusCode).json({
            statusCode,
            success: false,
            message: error.message
        });
    }
};

export { asyncHandler };
