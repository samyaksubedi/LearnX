import { envVariables } from '../configs/env.config.js';
import { prisma } from '../db/client.db.js';
import { ApiError } from '../utils/api-output.util.js';
import jwt from 'jsonwebtoken';
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    let decoded;

    try {
      decoded = jwt.verify(token, envVariables.ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw new ApiError(
        401,
        err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      );
    }

    const session = await prisma.userSession.findUnique({
      where: { id: decoded.sessionId },
    });

    if (!session) {
      throw new ApiError(401, 'Session expired or revoked');
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export { authenticateUser };
