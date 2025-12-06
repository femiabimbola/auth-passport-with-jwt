import jwt from 'jsonwebtoken';
import { AccessTokenPayload, User } from '../types/token.types';

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES = '15m',
  REFRESH_TOKEN_EXPIRES = '7d',
} = process.env;

export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET!, {
    expiresIn: parseInt(ACCESS_TOKEN_EXPIRES || '3600', 10),
  });
};

// export const generateAccessToken = (user: User): string => {
//   const payload: AccessTokenPayload = {
//     userId: user.id,
//     email: user.email,
//   };
//   return jwt.sign(payload, JWT_ACCESS_SECRET!, {
//     expiresIn: parseInt(ACCESS_TOKEN_EXPIRES),
//   });
// };

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET!, {
    expiresIn: parseInt(REFRESH_TOKEN_EXPIRES),
  });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, JWT_ACCESS_SECRET!);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, JWT_REFRESH_SECRET!);
};
