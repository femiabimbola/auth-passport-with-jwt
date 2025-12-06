// src/config/passport.ts
import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from 'passport-jwt';
import { Algorithm } from 'jsonwebtoken';
import User from '../models/User';

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined in environment');
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
  // Optional but HIGHLY recommended in production
  issuer: 'your-app-name', // e.g., 'myapi.com'
  audience: 'your-app-client', // e.g., 'web', 'mobile'
  algorithms: ['HS256'] as Algorithm[], // enforce algorithm (prevent none attack)
};

const verifyCallback = async (payload: any, done: VerifiedCallback) => {
  try {
    // Standard claim is `sub`, not `id`
    const user = await User.findById(payload.sub)
      .select('-password -__v') // exclude sensitive fields
      .lean(); // return plain object (faster)

    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    // This will be attached to req.user
    return done(null, {
      id: user._id,
      email: user.email,
      // add any other fields you want available in req.user
    });
  } catch (err) {
    return done(err, false);
  }
};

const setupPassport = (passportInstance: typeof passport) => {
  passportInstance.use(new JwtStrategy(jwtOptions, verifyCallback));
};

export default setupPassport;
