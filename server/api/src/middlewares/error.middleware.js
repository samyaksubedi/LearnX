import { logger } from '../configs/logger.config.js';
import { ApiError } from '../utils/api-output.util.js';

//!  Here err can be the  the instance of ApiError passed by the corresponding services or any unhandled error which was bubbling up

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    // Known Developer Generated Business Error
    logger.warn('Predicted Error :', {
      method: req.method,
      route: req.originalUrl,
      message: err.message,
    });

    return res.status(err.statusCode).json(err); // here err is just an instance of ApiError
  }

  logger.error('Unhandled Error :', {
    method: req.method,
    route: req.originalUrl,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  //   ( Internal Server Error / Unhandled Error ) - Response
  return res.status(500).json(new ApiError(500, `Internal Server Error`));
};

export { errorMiddleware };
