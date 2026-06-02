import { ApiError } from '../utils/api-output.util.js';

const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    const result = schema.safeParse(req[source]); // req.body or req.params or req.query

    if (!result.success) {
      return res.status(400).json(
        new ApiError(
          400,
          `Error validating req.${source}`,
          result.error.issues.map((e) => ({
            path: e.path,
            message: e.message,
          })),
        ),
      );
    }

    req[source] = result.data;
    next();
  };
};

export { validate };
