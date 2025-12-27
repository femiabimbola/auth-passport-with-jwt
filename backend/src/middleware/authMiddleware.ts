// src/middleware/authenticateJWT.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/token';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is not defined');
}

interface JwtPayload {
  sub: string;
  // add other fields if you include them in the token
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
  const payload = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
    // Attach user info to request
    req.user = { id: payload.sub };

    next();
    return;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Access token expired' });
    }
    return res.status(401).json({ message: 'Invalid access token' });
  }
};
