import multer from 'multer';
import { logger } from '../configs/logger.config.js';
import { ApiError } from '../utils/api-output.util.js';

//! Here err can be the instance of ApiError passed by services,
//! MulterError from file uploads, or any unexpected error.

const errorMiddleware = (err, req, res, next) => {
  // console.log(err);
  // console.log(typeof err);
  // console.log(err.stack);
  if (err instanceof ApiError) {
    logger.warn('Predicted Error :', {
      method: req.method,
      route: req.originalUrl,
      message: err.message,
    });

    return res.status(err.statusCode).json(err);
  }

  if (err instanceof multer.MulterError) {
    logger.warn('Multer Error :', {
      method: req.method,
      route: req.originalUrl,
      message: err.message,
    });

    return res.status(400).json(new ApiError(400, err.message));
  }

  logger.error('Unhandled Error :', {
    method: req.method,
    route: req.originalUrl,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  return res.status(500).json(new ApiError(500, 'Internal Server Error'));
};

export { errorMiddleware };
