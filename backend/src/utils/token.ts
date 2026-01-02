import jwt from 'jsonwebtoken';
import { AccessTokenPayload, User } from '../types/token.types';
import { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES = '20m',
  REFRESH_TOKEN_EXPIRES = '7d',
} = process.env;

export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET!, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET!, {
    expiresIn: parseInt(REFRESH_TOKEN_EXPIRES),
  });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, JWT_ACCESS_SECRET!);
};

// export const verifyRefreshToken = (token: string): any => {
//   console.log("token", token)
//   return jwt.verify(token, JWT_REFRESH_SECRET!);
// };


export const verifyRefreshToken = (token: string): { payload: any } | { error: string; status: number } => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!); // or your env var name
    return { payload };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { error: 'Refresh token expired', status: 401 };
    }
    if (error instanceof JsonWebTokenError) {
      return { error: 'Invalid refresh token', status: 401 };
    }
    if (error instanceof NotBeforeError) {
      return { error: 'Refresh token not yet valid', status: 401 };
    }

    // Any other unexpected error (e.g., malformed token string)
    return { error: 'Invalid refresh token', status: 401 };
  }
};